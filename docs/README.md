# Via Profit services / Core

![via-profit-services-cover](./assets/via-profit-services-cover.png)

> Via Profit services / **Core** - это основной пакет `via-profit-services` предоставляющий [GraphQL](https://graphql.org/)-сервер и сервер аутентификации. Пакет осуществляет обвязку между всеми имеющимися модулями данной системы и реализует собой приложение.

## Содержание

 - [Как использовать](#how-to-use)
 - [Логгер](#logger)
 - [Error handlers (исключения)](#error-handlers)
 - [Contributing](./contributing)

## <a name="how-to-use"></a> Как использовать

Для создания сервера необходимо сконфигурировать [логгер](#logger), создать инстанс приложения и запустить `bootstrap` метод.

При запуске в `development` режиме в консоли будет отображена информация для отладки

```ts
import { App, configureLogger } from '@via-profit-services/core';
import myGraphQLSchema from './my-graphql-schema';

// configure main logger
const logger = configureLogger({
  logDir: 'log', // you should pass the path relative to the project root
});

// create application
const app = new App({
  schemas: [myGraphQLSchema],
  logger,
  jwt: { ... },
  database: { ... },
  ...
});

// autostart server
app.bootstrap();

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
    catalog: catalogLogger,  // <-- your logger is here
  }
});

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
```
