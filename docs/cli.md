# CLI

> Via Profit services / **Core**

Пакет имеет `cli` интерфейс `via-profit-core`

Список команд доступен в меню `--help`:

```bash
yarn via-profit-core --help
```

Основное предназначение инструмента - получение миграций и сидов из прочих установленных модулей `via-profit-services`. Например, чтобы получить все файлы миграций необходимо выполнить:

```bash
yarn via-profit-core get-migrations -m ./database/migrations -s ./database/seeds
```