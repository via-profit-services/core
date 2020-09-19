## 0.30.0
###### *18 Сентября 2020*

### Основные изменения

Теперь ядро экспортирует все типы **Knex**, а так же сам knex, поэтому теперь пропадает необходимость устанавливать Knex в качестве dev-зависимости только ради миграций и сидов.

### Изменения и дополнения

1. Полностью переписан `cli` интерфейс. Добавлены команды для работы с микграциями.
2. Основной модуль ядра теперь экспортирует весь Knex, где `Knex` является типом (нейспейсом), а `knex` - непосредственно сам модуль knex:

_Пример: фрагмент файла миграций_
```ts
import { Knex } from '@via-profit-services/core';

export async function down(knex: Knex): Promise<unknown> {
  return knex.raw(`
    DROP TABLE IF EXISTS "myTable" CASCADE;
  `);
}
```
3. Теперь миграции и сиды создаются с заранее заготовленным шаблоном вместо stub-файла по умолчанию


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