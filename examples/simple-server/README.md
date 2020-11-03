# Пример реализации простого сервера

## Запуск

Для запуска проекта перейдите в каталог, установите зависимости, выполните миграции и запустите сервер:

```bash
yarn
yarn via-profit-core get-migrations -m ./database/migrations
yarn via-profit-core knex migrate latest --knexfile ./utils/knexfile.ts
yarn build
node ./build/index.js
```

## Структура

 - **keys** - Ключи для JWT
 - **schemas** - Пример реализации схемы и резолверов
 - **webpack** - Конфигурация webpack для сборки и запуска проекта (в development режиме)
 - **utils**
   - `configureApp.ts` - Файл конфигурации сервера
   - `knexfile.ts` - Knexfile для запуска миграций