# Список параметров

> Via Profit services / **Core**

Параметры определяются интерфейсом <InitProps>, который можно импортировать для создания отдельного модуля конфигурации:

_Пример организации модуля конфигурации **configureApp.ts**_

```ts
import { InitProps, configureLogger } from '@via-profit-services/core';

const configureApp: InitProps = {
  port: 9000,
  logger: configureLogger({
    logDir: path.resolve(__dirname, 'log'),
  }),
  ...
};

export default configureApp;

```

## Список параметров

| Параметр                        | Тип                         | Обязательный | Описание                                                                                                                                                                         |
| :------------------------------ | :-------------------------- | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                          | `number`                    |              | Номер порта на котором должен запуститься сервер, по умолчанию - `4000`                                                                                                          |
| `endpoint`                      | `string`                    |              | endpoint graphql сервера, по умолчанию - `/graphql`                                                                                                                              |
| `authEndpoint`                  | `string`                    |              | endpoint сервера авторизации, по умолчанию - `/auth`                                                                                                                             |
| `subscriptionEndpoint`          | `string`                    |              | endpoint graphql сервера subscriptions, по умолчанию - `/subscriptions`                                                                                                          |
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
| `logger`                        | `LoggersConfig`             |      Да      | Объект настроек логгера                                                                                                                                                          |
| `logger.logDir`                 | `string`                    |      Да      | Путь расположения директории логов                                                                                                                                               |
| `logger.logDir.loggers`         | `{ [key: string]: Logger }` |      Да      | Объект произвольных логгеров, которые будут доступны в контексте                                                                                                                 |
| `typeDefs`                      | `ITypedef[]`                |              | Массив GraphQL типов (SDL - схемы)                                                                                                                                               |
| `resolvers`                     | `IResolvers[]`              |              | Массив GraphQL резолверов                                                                                                                                                        |
| `middlewares`                   | `IMiddlewareGenerator[]`    |              | Массив GraphQL middleware                                                                                                                                                        |
| `serverOptions`                 | `https.ServerOptions`       |      Да      | Объект настроек `https` сервера                                                                                                                                                  |
| `serverOptions.key`             | `string`                    |              | Путь до файла приватного ключа сертификата домена (SSL)                                                                                                                          |
| `serverOptions.cert`            | `string`                    |              | Путь до файла сертификата домена (SSL)                                                                                                                                           |
| `serverOptions.cookieSign`      | `string`                    |      Да      | Секретный ключ для подписи Cookies                                                                                                                                               |
| `routes`                        | `object`                    |              | Объект URL адресов                                                                                                                                                               |
| `routes.auth`                   | `string`                    |              | URL путь (без схемы и протокола) нахождения сервера аутентификации, по умолчанию - `/auth`                                                                                       |
| `enableIntrospection`           | `boolean`                   |              | Разрешить доступ к Introspection (Всегда разрешено в `development` режиме)                                                                                                       |
| `redis`                         | `object`                    |              | Параметры пакета [ioredis](https://github.com/luin/ioredis/))                                                                                                                    |
| `staticOptions`                 | `object`                    |              | Параметры предоставления статических файлов (подробнее см. [Express Static](https://expressjs.com/ru/starter/static-files.html)))                                                |
| `staticOptions.prefix`          | `string`                    |              | Виртуальный префикс директории статических файлов)                                                                                                                               |
| `staticOptions.staticDir`       | `string`                    |              | Путь до директории статических файлов                                                                                                                                            |
| `expressMiddlewares`            | `array`                     |              | Массив, содержащий функции вызова [Express middleware](https://expressjs.com/ru/guide/using-middleware.html) (подробнее [здесь](#express-middleware))                            |
| `sessions`                      | `SesstionStoreOptions`      |              | Параметры сессий [Express Session File Storage](https://github.com/valery-barysok/session-file-store#options)                                                                    |
