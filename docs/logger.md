# Логгер

> Via Profit services / **Core**

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

- `session` - серверный логгер уровня `info` для регистрации сессий. Имеет транспорт:
  - DailyRotateFile уровня `info`. Записывает в файл `sessions-%DATE%.log`
- `server` - серверный логгер уровня `debug` для регистрации ошибок и отладочных данных. Имеет два транспорта:
  - DailyRotateFile уровня `error`. Записывает в файл `errors-%DATE%.log`
  - DailyRotateFile уровня `warn`. Записывает в файл `warnings-%DATE%.log`
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
