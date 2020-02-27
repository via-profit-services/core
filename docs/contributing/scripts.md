# npm-скрипты

В качестве основного пакетного менеджера используется [yarn](https://yarnpkg.com/), но все действия возможно выполнять и с [npm](https://www.npmjs.com/get-npm)

## Содержание

 - [Запуск проекта в development режиме](#start-dev)
 - [Запуск проекта в production режиме](#start-dist)
 - [Финальная сборка проекта для production](#dist)
 - [Cборка проекта для production](#build-dist)
 - [Cборка проекта для development](#build-dev)
 - [Запуск линтера](#lint)
 - [Запуск тестов](#test)


## <a name="start-dev"></a> Запуск проекта в `development` режиме

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
  - [GraphQL-playground](./graphql-playground.md)
  - [GraphQL-voyager](./graphql-voyager.md)


## <a name="start-dist"></a> Запуск проекта в `production` режиме

```bash
yarn start:dist
```

Будет произведена сборка проекта для `production` (запустится [yarn dist](#dist)), после чего управление переходит на [playground](./playground.md)


## <a name="dist"></a>Финальная сборка проекта для production

```bash
yarn dist
```

Данный скрипт последовательно запустит [yarn lint](#lint), [yarn test](#test) и [yarn build:dist](#build-dist), что в свою очередь запустит линтер, затем все тесты, после чего выполнит сборку проекта для `production`


## <a name="build-dist"></a>Cборка проекта для production

```bash
yarn build:dist
```

Проект будет собран с использованием конфигурации webpack для `production`. В данном случае используются `webpack/webpack.config.base.js` и `webpack/webpack.config.prod.js`.

Готовая сборка будет располагаться в директории `dist`.


## <a name="build-dev"></a>Cборка проекта для development

```bash
yarn build:dev
```

Проект будет собран с использованием конфигурации webpack для `development`. В данном случае используются `webpack/webpack.config.base.js` и `webpack/webpack.config.dev.js`.

Готовая сборка будет располагаться в директории `build`.


## <a name="lint"></a>Запуск линтера

```bash
yarn lint
```

Данный скрипт запустит [ESLint](https://eslint.org/) для директории `src`. В проверке участвуют файлы с расширением `.ts`. ESLint запускается с ключем `--fix`, что позволяет, при наличии возможности, автоматически исправлять некоторые ошибки.


## <a name="test"></a>Запуск тестов

```bash
yarn test
```

Данный скрипт запустит все имеющиеся тесты.