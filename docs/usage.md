# Использование

## Содержание

 - [Как использовать](#how-to-use)
 - [Логгер](#logger)
 - [Error handlers (исключения)](#error-handlers)

## <a id="how-to-use"></a> Как использовать

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

## <a id="logger"></a> Логгер

Логгер - это объект, содержащий несколько ключей, в качестве значения которых выступает уже настроенный пакет [Winston](https://github.com/winstonjs/winston). Этот объект-коллекция добавляется в контекст, передаваемый в каждый резолвер. Логгеры используется внутренними компонентами для регистрации ошибок, отладочной информации и пр. В 90% случаев вам будет необходим лишь один логгер: `logger.server.debug('Message')`.

При возникновении ошибок, например, если бросить исключение `throw new Error('message')`, текст ошибки и стек вызова будет зарегистрирован в файле `%DATE%-errors.log`. Поэтому везде, где это необходимо, следует использовать [исключения](#error-handlers).

Пример использования логгера в резолвере:
```ts
...
const { logger } = context;
logger.server.debug('My debug message');
...

```

Логгер всегда содержит:
 - `server` - серверный логгер уровня `debug` для регистрации ошибок и отладочных данных. Имеет два транспорта:
   - DailyRotateFile уровня `error`. Записывает в файл `%DATE%-errors.log`
   - DailyRotateFile уровня `debug`. Записывает в файл `%DATE%-debug.log`
 - `sql` - логгер запросов в базу данных. Уровень логгера - `debug`. Имеет два транспорта:
   - DailyRotateFile уровня `debug`. Записывает в файл `%DATE%-sql.log`
   - Console уровня `error`. Выводит в консоль
 - `auth` - логгер авторизации. Уровень логгера - `info`. Имеет два транспорта:
   - DailyRotateFile уровня `info`. Записывает в файл `%DATE%-auth.log`
   - DailyRotateFile уровня `debug`. Записывает в файл `%DATE%-debug.log`
 - `http` - логгер регистрации всех HTTP запросов к серверу. Уровень логгера - `info`. Имеет один транспорт:
   - DailyRotateFile уровня `info`. Записывает в файл `%DATE%-http.log`


## <a id="error-handlers"></a> Error handlers (исключения)

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