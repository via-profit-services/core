# Via Profit services / Core

![via-profit-services-cover](./assets/via-profit-services-cover.png)

> Via Profit services / **Core** - это основной пакет `via-profit-services` предоставляющий [GraphQL](https://graphql.org/)-сервер и сервер аутентификации. Пакет осуществляет обвязку между всеми имеющимися модулями данной системы и реализует собой приложение


![npm (scoped)](https://img.shields.io/npm/v/@via-profit-services/core?color=blue)
![NPM](https://img.shields.io/npm/l/@via-profit-services/core?color=blue)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@via-profit-services/core?color=green)

Via Profit services представляет собой GraphQL сервер с поддержкой Subscriptions, встроенной системы аутентификации/авторизации и базой данных PostgreSQL.

## Комплектация
 - [Express GraphQL](https://github.com/graphql/express-graphql) - Основной сервер
 - [Graphql Redis Subscriptions](https://github.com/davidyaha/graphql-redis-subscriptions) - Subscriptions на базе Redis
 - [JWT](https://github.com/auth0/node-jsonwebtoken) - Аутентификация/Авторизация
 - [Knex](https://github.com/knex/knex) - Модуль работы с базами данных (используется исключительно PostgreSQL)
 - [Redis](https://github.com/auth0/node-jsonwebtoken) - Redis, с взаимодействием через [ioredis](https://github.com/luin/ioredis)
 - [Winston Logger](https://github.com/winstonjs/winston) - Система логирования
 - [Node Cron](https://github.com/kelektiv/node-cron) - Реализация Crontab
 - [Device Detector](https://github.com/etienne-martin/device-detector-js) - Определение данных устройства при выдаче Access Token

## Системные требования
 - NodeJS
 - Nginx
 - Redis
 - PostgreSql

## Документация
Документация доступна [здесь](./docs/README.md)

## License
Via Profit Services рспространяется под лицензией [MIT](./LICENSE).
