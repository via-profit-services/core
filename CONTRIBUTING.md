# Contributing

Разработка проекта ведется на ветке `dev`. `master` ветка обновляется **только** по средствам Merge Request.

##  Issue tracker

[Issue tracker](https://gitlab.com/via-profit-services/core/issues) является предпочтительным каналом для баг репортов.

## Содержание

 - [Установка и настройка](#setup)
 - [Конвенция](./README.md#convention)
 - [npm-скрипты](#scripts)
 - [Playground](#playground)
 - [GraphQL Playground](#graphql-playground)
 - [GraphQL Voyager](#graphql-voyager)
 - [Структура проекта и особенности сборки](#structure)


## <a name="setup"></a> Установка и настройка

Необходимо указать необходимую версию вместо `#1.0.0`.

```bash
yarn add ssh://git@gitlab.com:via-profit-services/core.git#1.0.0
```

**Замечание:** Чтобы запустить localhost на SSL используйте [mkcert](https://github.com/FiloSottile/mkcert) 

Для работы [JWT](https://github.com/auth0/node-jsonwebtoken) необходимо сгенерировать SSH-ключи используя алгоритм, например, `RS256`.

**Замечание:** При запросе `passphrase` просто нажмите _Enter_ для того, чтобы этот параметр остался пустым. То же самое необходимо сделать при подтверждении `passphrase`.

В корне проекта (на том же уровне, что и `package.json`) создайте директорию `misc/keys` и создайте в ней ключи выполнив команды:

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```
После выполнения команд будут создан приватный ключ(`jwtRS256.key`) и публичный ключ (`jwtRS256.key.pub`) 


Для хранения реквизитов доступа и прочих настроек, зависящих от устройства, на котором разрабатывается и запускается проект, используется [DotEnv](https://github.com/motdotla/dotenv).

В корне проекта (на том же уровне, что и `package.json`) создайте файл `.env` со следующим содержимым:


```dosini
PORT=4000

LOG=./misc/log

GQL_ENDPOINT=/graphql
GQL_SUBSCRIPTIONENDPOINT=/subscriptions

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
JWT_PRIVATEKEY=./misc/keys/jwtRS256.key
JWT_PUBLICKEY=./misc/keys/jwtRS256.key.pub
JWT_BLACKLIST=./misc/blacklist.json

SSL_KEY=/home/me/.local/share/mkcert/localhost-key.pem
SSL_CERT=/home/me/.local/share/mkcert/localhost.pem

TIMEZONE=UTC

COOKIES_SIGN_SECRET= <-- Секрет для подписи Cookies
```

**Замечание:** Старайтесь не использовать `process.cwd()` там, где это пересекается с `knex`, т.к. knex переопределяет рабочию директорию в некоторых случаях, например, при использовании миграций ([issue #2952](https://github.com/knex/knex/issues/2952))


## <a name="scripts"></a> npm-скрипты


 - [Запуск проекта в development режиме](#start-dev)
 - [Запуск проекта в production режиме](#start-dist)
 - [Финальная сборка проекта для production](#dist)
 - [Cборка проекта для production](#build-dist)
 - [Cборка проекта для development](#build-dev)
 - [Запуск линтера](#lint)
 - [Запуск тестов](#test)
 - [Релизы / патчи / пререлизы и т.д.](#release)


### <a name="start-dev"></a> Запуск проекта в `development` режиме

```bash
yarn start:dev
```

У этой команды имеется алиас:
```bash
yarn start
```

Проект будет собран и запущен в `development` режиме. Сборка осуществляется при помощи [Webpack](https://webpack.js.org/) с ключем `--watch`. В данном случае webpack будет следить за файлами в  директории `src` и перекомпилировать их всякий раз, когда они меняются.

Так как данный модуль является сервером, который необходимо сконфигурировать и запустить, то роль крипта, который должен настроить и запустить сервер, берет на себя [playground](./playground.md).

После сборки в директории `build`, в корне проекта, вы найдете все собранные модули.

После запуска будет инициализирован:
  - Основной сервер
  - GraphQL-сервер
  - [GraphQL-playground](#graphql-playground)
  - [GraphQL-voyager](#graphql-voyager)


### <a name="start-dist"></a> Запуск проекта в `production` режиме

```bash
yarn start:dist
```

Будет произведена сборка проекта для `production` (запустится [yarn dist](#dist)), после чего управление переходит на [playground](./playground.md)


### <a name="dist"></a>Финальная сборка проекта для production

```bash
yarn dist
```

Данный скрипт последовательно запустит [yarn lint](#lint), [yarn test](#test) и [yarn build:dist](#build-dist), что в свою очередь запустит линтер, затем все тесты, после чего выполнит сборку проекта для `production`


### <a name="build-dist"></a>Cборка проекта для production

```bash
yarn build:dist
```

Проект будет собран с использованием конфигурации webpack для `production`. В данном случае используются `webpack/webpack.config.base.js` и `webpack/webpack.config.prod.js`.

Готовая сборка будет располагаться в директории `dist`.


### <a name="build-dev"></a>Cборка проекта для development

```bash
yarn build:dev
```

Проект будет собран с использованием конфигурации webpack для `development`. В данном случае используются `webpack/webpack.config.base.js` и `webpack/webpack.config.dev.js`.

Готовая сборка будет располагаться в директории `build`.


### <a name="lint"></a>Запуск линтера

```bash
yarn lint
```

Данный скрипт запустит [ESLint](https://eslint.org/) для директории `src`. В проверке участвуют файлы с расширением `.ts`. ESLint запускается с ключем `--fix`, что позволяет, при наличии возможности, автоматически исправлять некоторые ошибки.


### <a name="test"></a>Запуск тестов

```bash
yarn test
```

Данный скрипт запустит все имеющиеся тесты.

### <a name="release"></a>Релизы / патчи / пререлизы и т.д.

```bash
yarn release:patch
yarn release:minor
yarn release:major
yarn release:prerelease
```



## <a name="playground"></a> Playground 

Так как весь проект является сервером, который необходимо сконфигурировать и запустить, то роль крипта, который должен настроить и запустить сервер, берет на себя playground.

Playground располагается в директории `src/playground`. Основная задача модуля - проедоставление возможности тестировать проект. Именно для этого playground содержит несколько простых GraphQL схем, расположенных в директории `src/playground/schemas`.

По сути, playground повторяет минимальный возможный код, который должен написать разработчик для запуска всего сервера. Иными словами, чтобы проверить работоспособность этого проетка нужно запустить playground.


## <a name="graphql-playground"></a> GraphQL Playground

[GraphQL Playground](https://github.com/prisma-labs/graphql-playground) - Это IDE, которая генерирует документацию по API, анализируя GrpahQL схему и резолверы. Помимо этого, GraphQL Playground позволяет тестировать запросы к API.

**GraphQL Playground** интегрирован в проект как Express middleware и по умолчанию всегда доступен в `development` режиме.

## <a name="graphql-voyager"></a> GraphQL Voyager

С [GraphQL voyager](https://github.com/APIs-guru/graphql-voyager) GraphQl-Voyager вы можете визуально изучить API GraphQL в виде интерактивного графика. Это отличный инструмент при разработке или обсуждении вашей модели данных. Он включает несколько примеров схем GraphQL, а также позволяет подключать его к своей конечной точке GraphQL. Чего же вы ждете, изучите свой API! (_[GraphQL Weekly #42](https://graphqlweekly.com/issues/42)_)

**GraphQL voyager** интегрирован в проект как Express middleware и по умолчанию всегда доступен в `development` режиме.

При запуске **GraphQL voyager** автоматически генерируется и добавляется к заголовкам `AccessToken`. Это необходимо для того, чтобы обойти защиту `src/authentificator/authentificatorMiddleware.ts`, которая блокирует все неавторизованные запросы.


## <a name="structure"></a> Структура проекта и особенности сборки
TODO Документация для «Структура проекта и особенности сборки»