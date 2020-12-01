## 0.31.6
###### *23 Ноября 2020*

 - Исправления сборки


## 0.31.5
###### *23 Ноября 2020*

 - Исправлены типы для экспорта webpack плагина. Теперь плагин импортируется так:
 ```js
 const ViaProfitPlugin = require('@via-profit-services/core/dist/webpack-plugin');

 ```

## 0.31.4
###### *20 Ноября 2020*

 - Исправлена ошибка сборки, при котрой в конечный билд перестали попадать stub-файлы

## 0.31.3
###### *20 Ноября 2020*

 - Исправлена ошибка CLI интерфейса, не позволявшая выполнить определенный сид-файл


## 0.31.2
###### *19 Ноября 2020*

 - Исправлена проблема авторизации
 - Внутренние улучшения кода
 - Webpack плагин вынесен в директорию `externals`. Полный импорт плагина теперь выглядит так:
   ```js
   const ViaProfitPlugin = require('@via-profit-services/core/externals/webpack-plugin');
   ```


## 0.31.1
###### *6 Ноября 2020*

 - Оптимизация

## 0.31.0
###### *5 Ноября 2020*

 - Удален graphql-voyager
 - Изменен способ проверки токена авторизации
 - Теперь модуль полностью Serverless за исключением некоторых зависимостей (см. ниже) 
 - `moment`, `moment-timezone` и `uuid` вынесены из модуля воизбежание дублирования кода в бандлах других модулей [via-profit-services](https://github.com/via-profit-services)
 - Интерфейс Graphiql теперь всегда выключен без возможности включения
 - В поставку Добавлен webpack plugin ViaProfitPlugin (см. [Установка и настройка](./docs/setup.md#setup))


## 0.30.13
###### *4 Ноября 2020*

 - Обновление инструментов сборки. Оптимизация


## 0.30.12
###### *4 Ноября 2020*

 - Обновление инструментов сборки. Оптимизация


## 0.30.11
###### *4 Ноября 2020*

### Основные изменения
 - Изменен тип аргументов CLI инструмента `via-profit-core`. Теперь аргументы `-m` и `-s` требуют указание пути после каждого ([см. документацию](./docs/cli.md)).


## 0.30.7
###### *26 Октября 2020*

### Основные изменения
 - Добавлены типы для расширений `.graphql`


## 0.30.5
###### *26 Октября 2020*

### Основные изменения
 - Логгер [Winston](https://github.com/winstonjs/winston) теперь экспортируется прямо из ядра:
  
  ```ts
  import { Winston } from '@via-profit-services/core';

  const { format, transports, createLogger } = Winston;
  createLogger({
    level: 'debug',
    format: format.combine(
      format.metadata(),
      format.json(),
    )
  })


  ```
 - [GeaphQL Tools / Schema](https://www.graphql-tools.com/docs/api/modules/schema) и все его типы теперь экспортируются напрямую из ядра:
 - [GeaphQL Tools / Utils](https://www.graphql-tools.com/docs/api/modules/utils) и все его типы теперь экспортируются напрямую из ядра:
  
  ```ts
  import { IObjectTypeResolver, IFieldResolver, Context } from '@via-profit-services/core';

  const ResolverObject: IObjectTypeResolver<any, Context> = {
    getTimezone: (parent, args, context) => context.timezone,
  };
  ``` 

## 0.30.4
###### *26 Октября 2020*

### Основные изменения
 - Обновление основных зависимостей до свежих версий
 - Проверка работоспособности на node `14.0.0`
 - Добавлен `Knex.PoolConfig` в настройки подключения к базе данных


## 0.30.3
###### *19 Октября 2020*

### Основные изменения
 - В CLI интерфейс добавлен метод позволяющий запустить все сиды разом (`via-profit-core knex seed run-all`)



## 0.30.2
###### *24 Сентября 2020*

### Основные изменения
 - Добавлен вывод `console.log` в случае, если при запуске сервера не удается соединиться с сервером базы банных


## 0.30.1
###### *21 Сентября 2020*

### Основные изменения

Изменены внутренние скрипты сборки проекта. Функционал не затронут

## 0.30.0
###### *18 Сентября 2020*

### Основные изменения

Теперь ядро экспортирует все типы **Knex**, а так же сам knex, поэтому теперь пропадает необходимость устанавливать Knex в качестве dev-зависимости только ради миграций и сидов.

### Изменения и дополнения

 - Полностью переписан `cli` интерфейс. Добавлены команды для работы с микграциями.
 - Основной модуль ядра теперь экспортирует весь Knex, где `Knex` является типом (нейспейсом), а `knex` - непосредственно сам модуль knex:

_Пример: фрагмент файла миграций_
```ts
import { Knex } from '@via-profit-services/core';

export async function down(knex: Knex): Promise<unknown> {
  return knex.raw(`
    DROP TABLE IF EXISTS "myTable" CASCADE;
  `);
}
```
 - Теперь миграции и сиды создаются с заранее заготовленным шаблоном вместо stub-файла по умолчанию


### Переход на версию 0.30.x

**Необходимые изменения в файлах `package.json`**

В блоке `"scripts"` необходимо заменить все скрипты, которые имеют отношение к **Knex** на следующие:

_Замечание:_ Добавился новый скрипт `via-profit-core:knex` для того чтобы каждый раз не указывать расположение knexfile.

```json
{
  ...
  "scripts": {
    "via-profit-core:knex": "yarn via-profit-core knex --knexfile src/utils/knexfile.ts",
    "knex:migrate:list": "yarn via-profit-core:knex migrate list",
    "knex:migrate:make": "yarn via-profit-core:knex migrate make --name",
    "knex:migrate:up": "yarn via-profit-core:knex migrate up",
    "knex:migrate:down": "yarn via-profit-core:knex migrate down",
    "knex:migrate:latest": "yarn via-profit-core:knex migrate latest",
    "knex:migrate:rollback": "yarn via-profit-core:knex migrate rollback",
    "knex:migrate:rollback:all": "yarn via-profit-core:knex migrate rollback-all",
    "knex:seed:make": "yarn via-profit-core:knex seed make --name",
    "knex:seed:run": "yarn via-profit-core:knex seed run --name"
  }
  ...
}

```

**Изменения в файлах миграций и сидов**

Необходимо заменить импорты Knex с:
```ts
import * as Knex from 'knex';
```
на
```ts
import { Knex } from '@via-profit-services/core';
```