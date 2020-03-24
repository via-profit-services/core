# Via Profit services / Core

![via-profit-services-cover](./assets/via-profit-services-cover.png)

> Via Profit services / **Core** - это основной пакет `via-profit-services` предоставляющий [GraphQL](https://graphql.org/)-сервер и сервер аутентификации. Пакет осуществляет обвязку между всеми имеющимися модулями данной системы и реализует собой приложение.

## Содержание

- [Установка и настройка](#setup)
- [Как использовать](#how-to-use)
- [Аутентификация](#authentication)
- [Параметры инициализации](#options)
- [Контекст](#context)
- [Логгер](#logger)
- [Cron](#cron)
- [Типы и интерфейсы](#types)
- [Error handlers (исключения)](#error-handlers)
- [CLI](#cli)
- [Contributing](./CONTRIBUTING.md)

## <a name="setup"></a> Установка и настройка

Для установки последней версии:

```bash
yarn add ssh://git@gitlab.com:via-profit-services/core.git
```

Для установки последней определенной версии, например, `0.1.6`:

```bash
yarn add ssh://git@gitlab.com:via-profit-services/core.git#0.1.6
```

Список версий см. [здесь](https://gitlab.com/via-profit-services/core/-/tags/)

**Замечание:** Чтобы запустить localhost на SSL используйте [mkcert](https://github.com/FiloSottile/mkcert)

Для работы [JWT](https://github.com/auth0/node-jsonwebtoken) необходимо сгенерировать SSH-ключи используя алгоритм, например, `RS256`.

**Замечание:** При запросе `passphrase` просто нажмите _Enter_ для того, чтобы этот параметр остался пустым. То же самое необходимо сделать при подтверждении `passphrase`.

В корне проекта (на том же уровне, что и `package.json`) создайте директорию `keys` и создайте в ней ключи выполнив команды:

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

После выполнения команд будут создан приватный ключ(`jwtRS256.key`) и публичный ключ (`jwtRS256.key.pub`)

Для хранения реквизитов доступа и прочих настроек, зависящих от устройства, на котором разрабатывается и запускается проект, используется [DotEnv](https://github.com/motdotla/dotenv).

В корне проекта (на том же уровне, что и `package.json`) создайте файл `.env` со следующим содержимым:
**Замечание:**: _Ниже представлен фрагмент минимальных настроек для полноценной работы сервера_

```dosini
PORT=4000

LOG=./log

GQL_ENDPOINT=/graphql
GQL_SUBSCRIPTIONSENDPOINT=/subscriptions

DB_HOST= <-- Хост базы данных
DB_USER= <-- Имя пользователя базы данных
DB_NAME= <-- Название базы данных
DB_PASSWORD= <-- Пароль базы данных
DB_TIMEZONE=UTC
DB_MIGRATIONS_DIRECTORY= <-- Путь до директории файлов миграций Knex (должна быть внутри src)
DB_MIGRATIONS_TABLENAME=knex_migrations
DB_MIGRATIONS_EXTENSION=ts
DB_SEEDS_DIRECTORY= <-- Путь до директории сид файлов Knex (должна быть внутри src)
DB_SEEDS_EXTENSION=ts

JWT_ALGORITHM=RS256
JWT_ACCESSTOKENEXPIRESIN=1800
JWT_REFRESHTOKENEXPIRESIN=2.592e6
JWT_ISSUER=viaprofit-services
JWT_PRIVATEKEY=./keys/jwtRS256.key
JWT_PUBLICKEY=./keys/jwtRS256.key.pub

SSL_KEY=/home/me/.local/share/mkcert/localhost-key.pem
SSL_CERT=/home/me/.local/share/mkcert/localhost.pem

TIMEZONE=UTC

COOKIES_SIGN_SECRET= <-- Секрет для подписи Cookies
```

**Замечание:** Старайтесь не использовать `process.cwd()` там, где это пересекается с `knex`, т.к. knex переопределяет рабочию директорию в некоторых случаях, например, при использовании миграций

## <a name="how-to-use"></a> Как использовать

### Сервер

Для создания сервера необходимо сконфигурировать [логгер](#logger), создать инстанс приложения и запустить `bootstrap` метод.

```ts
import { App, configureLogger } from '@via-profit-services/core';
import myGraphQLSchema from './my-graphql-schema';
import fs from 'fs';

// Конфигурируем логгер
const logger = configureLogger({
  logDir: path.resolve(__dirname, './log'), // Необходимо передать относительный путь от корня проекта
});

// Создание объекта приложения
const app = new App({
  schemas: [myGraphQLSchema],
  logger,
  jwt: { ... },
  database: { ... },
  serverOptions: {
    key: fs.readFileSync('/path/to/cert-key.pem'),
    cert: fs.readFileSync('/path/to/cert.pem'),
  },
  ...
});

// Запуск сервера
app.bootstrap();

```

### `buildQueryFilter`

Принимает объект входных фильтров согласно спецификации GraphQL и возвращает объект, готовый для передачи в любой сервис для выборки списка каких-либо данных, например:

```ts
import { IContext, buildQueryFilter, IDirectionRange } from '@via-profit-services/core';
import { IResolverObject } from 'graphql-tools';
import MyService from './my-service';

interface IListArgs {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
  orderBy?: {
    field: string;
    direction: IDirectionRange;
  };
}

export const MyQueries: IResolverObject<any, IContext, IListArgs> = {
  list: async (obj, args, context) => {
    // аргумент args = { first, last, after, before, orderBy }

    // Преобразование входных данных в фильтр для модели сервиса
    const queryFilter = buildQueryFilter(args);

    // Инициализация какого-либо сервиса
    const service = new MyService({ context });

    // Вызов метода сервиса, который принимает преобразованный фильтр
    // Метод сервиса должен возвращать объект типа <IListResponse>:
    // interface IListResponse<TNodeData> {
    //   totalCount: number;
    //   nodes: Node<TNodeData>[]; // <-- массив объектов, содержащих ключ cursor типа number
    //   limit: number;
    // }
    const { totalCount, nodes, limit } = await service.getListOfMyData(queryFilter);

    // Преобразовываем полученные данные в GraphQL Cursor Connections (см. след пример)
    const connection = buildCursorConnection({ totalCount, nodes, limit });

    return connection;
  },
};
```

### `buildCursorConnection`

Принимает в качестве единственного аргумента объект типа `<IListResponse>` и возвращает объект типа `<ICursorConnectionProps>`, который соответствует возвращаемому значению [GraphQL Cursor Connections](https://facebook.github.io/relay/graphql/connections.htm) (см. предыдущий пример):

### `stringToCursor`

Принимает в качестве единственного аргумента строку или число и возвращает `base64` закодированную строку. Применяется для кодирования курсоров.

### `cursorToString`

Принимает в качестве единственного аргумента `base64` строку, и возвращает ее декодированное значение. Применяется для декодирования курсоров.

## <a name="authentication"></a> Аутентификация

Сервер аутентификации работает по протоколу [REST](https://ru.wikipedia.org/wiki/REST), т.к. любое обращение к GraphQL требует наличие авторизации, включая интроспекцию схемы.

URL адрес сервера аутентификации определяется по шаблону: `https://localhost:[port][routes.auth]`, по умолчанию - `https://localhost:4000/auth`

### Схема взаимодействия

Сервер аутентификации позволяет получать `Access` токен и обменивать `Refresh` токен на новую пару токенов в соответствии с соглашением об аутентификации JWT. После успешного получения Access токена, сервер сам установит *httpOnly* *secure* **cookies** `AccessToken` с Access токеном в качестве значения и `RefreshToken` соответственно. Это необходимо для того, чтобы ваше клиентское web-приложение автоматически передавало токен авторизации при каждом запросе к GraphQL, но при этом не имело доступа к самому токену ([httpOnly Cookies](https://developer.mozilla.org/ru/docs/Web/HTTP/%D0%9A%D1%83%D0%BA%D0%B8)). Сервер GraphQL, в свою очередь, принимая запрос от клиента проверяет наличие токена авторизации сначала в заголовке `Authorization` и если не находит его там, то ищет значение cookies с именем `AccessToken`, ожидая там наличие соответствующего токена. При запросе к методу `/refresh-token`, сервера авторизации, будет осуществлен поиск Refresh токена сначала в куках под ключом `RefreshToken`, затем в теле запроса с тем же ключом. Время жизни таких кук равняется сроку истечения соответствующего токена.

**Замечание:** Все данные передаются в теле запроса в формате [JSON](https://ru.wikipedia.org/wiki/JSON), а сам запрос доступен только через **POST**.

**Замечание:** Для того, чтобы ваше клиентское приложение автоматически передавало куки в запросе к GraphQL серверу, необходимо, чтобы `fetch` запрос содержал опцию `credentials` со значением `include` и был установлен заголовок `Access-Control-Allow-Origin` с url адресом сервера в качестве значения:
```ts
fetch('https://localhost:4000/graphql', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://localhost:4000',
  },
  body: JSON.stringify({
    query: `
      query{
        info {
          developer {
            name
            url
          }
        }
      }
    `,
  }),
})
```

### Payload токена

Каждый токен содержит `payload` данные:

**Payload для Access токена**

| Параметр | Значение |
|----------|----------|
| `type` | Тип токена. Может иметь значение `access` для Access токена и `refresh` для Refresh токена |
| `id` | ID токена |
| `uuid` | ID аккаунта, для которого выдан токен |
| `roles` | Массив ролей аккаунта |
| `exp` | время в формате Unix Time, определяющее момент, когда токен станет не валидным (expiration) |
| `iss` | чувствительная к регистру строка или URI, которая является уникальным идентификатором стороны, генерирующей токен (issuer) |
| `associated` | Параметр содержится только в payload у Refresh токена и определяет ID Access токена, с которым он (Refresh токен) является парным |

Пример `payload` для Access токена
```json
{
  "type": "access",
  "id": "b485d679-facc-4afe-b6a0-f17ab387db9b",
  "uuid": "97878833-61ea-41f0-aeae-ec9d4b887447",
  "roles": ["manager", "writer"],
  "exp": 1584939413,
  "iss": "viaprofit-services"
}
```



### Методы сервера аутентификации

#### `/access-token`

Метод принимает данные аутентификации и возвращает, в случае успеха, пару токенов
В качестве данных аутентификации принимвется логин и пароль переданные в теле запроса под ключами `login` для логина и `password` для пароля

**Параметры запроса:**
```json
{
  "login": "My login",
  "password": "My password"
}
```
**Пример ответа:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMGE1YTQyMGUtODJiNS00NGM5LTk...",
  "tokenType": "Bearer",
  "expiresIn": 1800,
  "refreshToken": "2ddhjIOcb8sJLV79Z0ZJNduELR4tBlPe0jc2s2vK3fqaDWJo1EXZ_UHLDLGCDyt0dOLR4tBlPe0..."
}
```

В случае ошибки будет возвращен `UnauthorizedError` с кодом **401**

#### `/refresh-token`

Метод принимает **Refresh** токен и возвращает, в случае успеха, новую пару токенов.
Refresh токен может быть передан одним из двух способов:
 1. В теле запроса под ключом `RefreshToken` (см. пример ниже)
 2. В Cookies под ключом `RefreshToken`

**Параметры запроса:**
```json
{
  "RefreshToken": "2ddhjIOcb8sJLV79Z0ZJNduELR4tBlPe0jc2s2vK3fqaDWJo1EXZ_UHLDLGCDyt0dOLR4tBlPe0...",
}
```
**Пример ответа:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMGE1YTQyMGUtODJiNS00NGM5LTk...",
  "tokenType": "Bearer",
  "expiresIn": 1800,
  "refreshToken": "iWRnvXZ4tnu-lsJOb65ujm43SqEcTERpF_Am7kIfLjCouENyo4nq5sJOb65ujm43SqEcTERsJO..."
}
```

В случае ошибки будет возвращен `UnauthorizedError` с кодом **401**

#### `/validate-token`

Метод принимает токен аутентификации и возвращает, в случае успеха, его payload.
Токен может быть передат в теле запроса под ключом `token`

**Параметры запроса:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMGE1YTQyMGUtODJiNS00NGM5LTk...",
}
```
**Пример ответа:**
```json
{
  "type": "access",
  "id": "b485d679-facc-4afe-b6a0-f17ab387db9b",
  "uuid": "97878833-61ea-41f0-aeae-ec9d4b887447",
  "roles": ["manager", "writer"],
  "exp": 1584939413,
  "iss": "viaprofit-services"
}
```

В случае ошибки будет возвращен `UnauthorizedError` с кодом **401**


## <a name="options"></a> Параметры инициализации

Параметры определяются интерфейсом <IInitProps>.

Список поддерживаемых опций:

| Параметр                        | Тип                         | Обязательный | Описание                                                                                                                                                                         |
| :------------------------------ | :-------------------------- | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                          | `number`                    |              | Номер порта на котором должен запуститься сервер, по умолчанию - `4000`                                                                                                          |
| `endpoint`                      | `string`                    |              | endpoint graphql сервера, по умолчанию - `/graphql`                                                                                                                              |
| `subscriptionsEndpoint`         | `string`                    |              | endpoint graphql сервера subscriptions, по умолчанию - `/subscriptions`                                                                                                          |
| `timezone`                      | `string`                    |              | Временная зона сервера. `timestamp` значения из базы данных бедет преобразованы в соответствующее часовому поясу время Значение будет добавлено в контекст. По умолчанию - `UTC` |
| `database`                      | `Knex.Config`               |      Да      | Объект параметров для работы с базой данных. Соответствует типу `Knex.Config`, но                                                                                                |
| `database.connection`           | `Knex.PgConnectionConfig`   |      Да      | Объект подключения к базе данных. Соответствует конфигурации `Postgresql` (см `Knex.PgConnectionConfig`)                                                                         |
| `database.connection.database`  | `string`                    |      Да      | Название базы данных                                                                                                                                                             |
| `database.connection.host`      | `string`                    |      Да      | Хост базы данных                                                                                                                                                                 |
| `database.connection.user`      | `string`                    |      Да      | Имя пользователя базы данных                                                                                                                                                     |
| `database.connection.password`  | `string`                    |      Да      | Пароль подключения к базе данных                                                                                                                                                 |
| `database.timezone`             | `string`                    |      Да      | Временная зона базы данных. Данное значение будет передано в запросе `SET TIMEZONE = ...` при установлении подключения к базе                                                    |
| `database.migrations`           | `Knex.MigratorConfig`       |      Да      | Объект настроек миграций                                                                                                                                                         |
| `database.migrations.directory` | `string`                    |      Да      | Путь до директории с миграциями                                                                                                                                                  |
| `database.migrations.tableName` | `string`                    |      Да      | Название служебной таблицы миграций Knex                                                                                                                                         |
| `database.migrations.extension` | `enum`                      |      Да      | Расширение файлов миграций (`ts` или `js`)                                                                                                                                       |
| `database.seeds`                | `Knex.SeedsConfig`          |      Да      | Объект настроек сидов                                                                                                                                                            |
| `database.seeds.directory`      | `string`                    |      Да      | Путь до директории с сидами                                                                                                                                                      |
| `database.seeds.extension`      | `enum`                      |      Да      | Расширение файлов сидов (`ts` или `js`)                                                                                                                                          |
| `jwt`                           | `IJwtConfig`                |      Да      | Объект настроек [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken). Значение будет добавлено в контекст                                                                  |
| `jwt.accessTokenExpiresIn`      | `number`                    |      Да      | Время в формате Unix Time, определяющее момент, когда токен станет не валидным (время жизни Access токена в секундах)                                                            |
| `jwt.algorithm`                 | `enum`                      |      Да      | Алгоритм подписи JWT                                                                                                                                                             |
| `jwt.issuer`                    | `string`                    |      Да      | Чувствительная к регистру строка или URI, которая является уникальным идентификатором стороны, генерирующей токен                                                                |
| `jwt.privateKey`                | `string`                    |      Да      | Путь до файла приватного ключа                                                                                                                                                   |
| `jwt.publicKey`                 | `string`                    |      Да      | Путь до файла с публичным ключом                                                                                                                                                 |
| `jwt.refreshTokenExpiresIn`     | `number`                    |      Да      | Время в формате Unix Time, определяющее момент, когда токен станет не валидным (время жизни Refresh токена в секундах)                                                           |
| `logger`                        | `ILoggerConfig`             |      Да      | Объект настроек логгера                                                                                                                                                          |
| `logger.logDir`                 | `string`                    |      Да      | Путь расположения директории логов                                                                                                                                               |
| `logger.logDir.loggers`         | `{ [key: string]: Logger }` |      Да      | Объект произвольных логгеров, которые будут доступны в контексте                                                                                                                 |
| `schemas`                       | `graphql.GraphQLSchema[]`   |      Да      | Массив GraphQL схем                                                                                                                                                              |
| `serverOptions`                 | `https.ServerOptions`       |      Да      | Объект настроек `https` сервера                                                                                                                                                  |
| `serverOptions.key`             | `string`                    |      Да      | Путь до файла приватного ключа сертификата домена (SSL)                                                                                                                          |
| `serverOptions.cert`            | `string`                    |      Да      | Путь до файла сертификата домена (SSL)                                                                                                                                           |
| `serverOptions.cookieSign`      | `string`                    |      Да      | Секретный ключ для подписи Cookies                                                                                                                                               |
| `routes`                        | `object`                    |              | Объект URL адресов                                                                                                                                                               |
| `routes.auth`                   | `string`                    |              | URL путь (без схемы и протокола) нахождения сервера аутентификации, по умолчанию - `/auth`                                                                                       |
| `routes.playground`             | `string`                    |              | URL путь (без схемы и протокола) нахождения Graphiql playground, по умолчанию - `/playground`                                                                                    |
| `routes.voyager`                | `string`                    |              | URL путь (без схемы и протокола) нахождения Graphiql voyager, по умолчанию - `/voyager`                                                                                          |
| `usePlayground`                 | `boolean`                   |              | Включить Graphiql Playground (Всегда включен в `development` режиме)                                                                                                             |
| `useVoyager`                    | `boolean`                   |              | Включить GraphQL Voyager (Всегда включен в `development` режиме)                                                                                                                 |

## <a name="context"></a> Контекст

Объект контекст передается в соответствии со спецификацией GraphQL и доступен из всех резолверов.

Контекст имеет тип `<IContext>`:

```ts
interface IContext {
  endpoint: string; // GraphQL endpoint
  jwt: IJwtConfig; // Параметры JSON web token
  knex: KnexInstance; // Инстанс Knex
  logger: ILoggerCollection; // Объект логгеров
  emitter: EventEmitter; // Стандартный nodejs EventEmitter
  timezone: string; // Текущая временная зона
}
```

## <a name="logger"></a> Логгер

Логгер - это объект, содержащий несколько ключей, в качестве значения которых выступает уже настроенный пакет [Winston](https://github.com/winstonjs/winston). Т.о. формируется коллекция логгеров. Эта коллекция добавляется в контекст, передаваемый в каждый резолвер. Логгеры используется внутренними компонентами для регистрации ошибок, отладочной информации и пр. В 90% случаев вам будет необходим лишь один логгер: `logger.server.debug('Message')`.

При возникновении ошибок, например, если бросить исключение `throw new Error('message')`, текст ошибки и стек вызова будет зарегистрирован в файле `errors-%DATE%.log`. Поэтому везде, где это необходимо, следует использовать [исключения](#error-handlers).

Пример использования логгера в резолвере:

```ts
...
const { logger } = context;
logger.server.debug('My debug message');
...

```

Логгер всегда содержит дочерние логгеры:

- `server` - серверный логгер уровня `debug` для регистрации ошибок и отладочных данных. Имеет два транспорта:
  - DailyRotateFile уровня `error`. Записывает в файл `errors-%DATE%.log`
  - DailyRotateFile уровня `debug`. Записывает в файл `debug-%DATE%.log`
- `sql` - логгер запросов в базу данных. Уровень логгера - `debug`. Имеет два транспорта:
  - DailyRotateFile уровня `debug`. Записывает в файл `sql-%DATE%.log`
  - Console уровня `error`. Выводит в консоль
- `auth` - логгер авторизации. Уровень логгера - `info`. Имеет два транспорта:
  - DailyRotateFile уровня `info`. Записывает в файл `auth-%DATE%.log`
  - DailyRotateFile уровня `debug`. Записывает в файл `debug-%DATE%.log`
- `http` - логгер регистрации всех HTTP запросов к серверу. Уровень логгера - `info`. Имеет один транспорт:
  - DailyRotateFile уровня `info`. Записывает в файл `http-%DATE%.log`

### Добавление собственных логгеров

Колекцию логгеров можно расширить путем добавления собственных используя свойство `loggers`. Это применимо, например, если модуль, используемый приложением, должен иметь возможность записывать свой лог в ту же директорию, что и все остальные логгеры. Свойство `loggers` принимает пары ключ-значние, где ключ - это имя логгера, который будет доступен в конетексте резолверов, а значение - настроенный логгер типа `<winston.Logger>`.

Например, модуль `catalog` предоставляет свой логгер, который возможно импортировать:
**Примечание:** В данном примере `configureCatalogLogger` - это обертка функции `createLogger` из пакета [Winston](https://github.com/winstonjs/winston), которая вернет тип `<winston.Logger>`.

```ts
import { configureCatalogLogger } from '@via-profit-services/catalog';
import { App, configureLogger } from '@via-profit-services/core';

const LOG_DIR = 'log';

// configure catalog logger
const catalogLogger = configureCatalogLogger({
  logDir: LOG_DIR,
});

// configure app logger
const logger = configureLogger({
  logDir: LOG_DIR,
  loggers: {
    catalog: catalogLogger, // <-- your logger is here
  },
});
```

## <a name="cron"></a> Cron

Для реализации Cron-подобных заданий используется `CronJobManager` - статический класс, являющийся оберткой над пакетом [Node-Cron](https://github.com/kelektiv/node-cron).

### Методы

**CronJobManager.`configure`** - Служебный метод первичной конфигурации клсаа. Вызывается единожды при инициализации приложения.

**CronJobManager.`addJob`** - Добавляет новое `Cron` задание и возвращает инстанс `CronJob`

_Параметры:_

- _jobName_ `string` - Уникальное имя задания
- _jobConfig_ `CronJobParameters` - Объект параметров [Node-cron](https://github.com/kelektiv/node-cron#api)

**CronJobManager.`getJob`** - Возвращает инстанс `CronJob` или `undefined`, если искомое задание не зарегистрировано
_Параметры:_

- _jobName_ `string` - Имя задания

**CronJobManager.`getPool`** - Возвращает весь пул заданий, которые имеются в памяти. Пул представлен стандартным типом `Map`

## <a name="types"></a> Типы и интерфейсы

```ts
// ENUM, который применяется в сортировках OrderBy
enum IDirectionRange {
  ASC = 'ASC',
  DESC = 'DESC',
}

// GraphQL Cursor Connection (см https://facebook.github.io/relay/graphql/connections.htm)
interface ICursorConnection<TNodeData> {
  edges: Array<{
    node: TNodeData;
    cursor: string;
  }>;
  pageInfo: IPageInfo;
  totalCount: number;
}

// GraphQL PageInfo (см https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo)
interface IPageInfo {
  startCursor?: string;
  endCursor?: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// GraphQL Edge (см https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types)
interface Edge<TNodeData> {
  node: TNodeData;
  cursor: string;
}

// Интерфейс ожидаемый от метода модели/сервиса при выборке списка данных содержащих постраничную пагинацию
interface IListResponse<TNodeData> {
  totalCount: number;
  nodes: Node<TNodeData>[];
  limit: number;
}
```

## <a name="error-handlers"></a> Error handlers (исключения)

Исключения ([exception](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Error)) позволяют регистрировать наличие ошибки и прерывать дальнейшее выполнение скрипта.

Доступные хэндлеры:

- **BadRequestError**. Код состояния ответа **400 Bad Request**.
- **UnauthorizedError**. Код состояния ответа **401 Unauthorized**.
- **ForbiddenError**. Код состояния ответа **403 Forbidden**.
- **NotFoundError**. Код состояния ответа **404 Not Found**.
- **ServerError**. Код состояния ответа **500 Internal Server Error**.

Пример регистрации ошибки:

```ts
import { BadRequestError } from '@via-profit-services/core';

throw new BadRequestError('Some Error');
```

## <a name="cli"></a> CLI

Пакет имеет `cli` интерфейс `via-profit-core`

Список команд:

| Команда          | Параметры                                                                                   | Описание                                                                                                                  | Пример                               |
| :--------------- | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------ | :----------------------------------- |
| `get-migrations` | `--migrations` (alis `-m`) - Копировать миграции<br>`--seeds` (alis `-s`) - копировать сиды | Осуществляет поиск файлов миграций во всех пакетах из `node_modules` и копирует их в директорию миграций текущего проекта | `via-profit-core get-migrations -ms` |
