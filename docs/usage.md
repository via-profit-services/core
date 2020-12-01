# Как использовать

> Via Profit services / **Core**

Для создания сервера необходимо:

 - Подготовить graphql схему(ы)
 - Подготовить graphql резолверы
 - Получить и выполнить необходимые миграции
 - Сконфигурировать [логгер](./logger.md)
 - Создать инстанс приложения
 - Запустить `bootstrap` метод


1. GraphQL схема

Согласно GraphQL спецификации, типы `Query`, `Mutation` и `Subscription` могут быть объявлены только один раз, поэтому, во избежании путаницы, Ядро объявляет все три типа, а все остальные схемы лишь расширяют их:

_Пример схемы **my-typedefs.graphql**_
```graphql
extend type Query {
  myModule: MyModuleQuery!
}

extend type Mutation {
  myModule: MyModuleMutation!
}

extend type Subscription {
  somethingChanes: String!
}

type MyModuleQuery {
  version: String!
}

type MyModuleMutation {
  updateAnything(input: String!): Boolean!
}
```

2. Резолвер

Резолвер определяется согласно принципам [graphql-tools](https://github.com/ardatan/graphql-tools) так как под капотом, Ядро использует именно graphql-tools для объединения схем и резолверов.

_Пример резолвера **my-resolver.ts**_

```ts
import { Context, IObjectTypeResolver } from '@via-profit-services/core';

const resolvers: IObjectTypeResolver<any, Context> = {
  Query: {
    myModule: () => ({}),
  },
  Mutation: {
    myModule: () => ({}),
  },
  MyModuleQuery: {
    version: (parent, args, context) => {
      return 'v0.1.1';
    },
  },
  Subscription: {
    somethingChanes: {
      subscribe: (parent, args, context) => {
        return context.pubsub.asyncIterator('triggerName');
      },
    },
  },
  MyModuleMutation: {
    updateAnything: (parent, args, context) => {
      const { input } = args;
      const { pubsub } = context;

      pubsub.publish('trigger', {
        updateAnything: 'payload data string',
      });
    },
  },
};

export default resolvers;
```

3. Получение миграций

Для того, чтобы восстановить необходимые таблицы базы данных, необходимо получить и выполнить требуемые миграции.

```bash
# Получить миграции
yarn via-profit-core get-migrations -m ./database/migrations

# Выполнить требуемые миграции
yarn via-profit-core knex migrate latest --knexfile src/utils/knexfile.ts
```

4. Инстанс приложения и запуск сервера

```ts
import { App, configureLogger } from '@via-profit-services/core';
import typeDefs from './my-typedefs';
import resolver from './my-resolver';
import fs from 'fs';

// Конфигурируем логгер
const logger = configureLogger({
  logDir: path.resolve(__dirname, './log'),
});

// Создание объекта приложения
const app = new App({
  typeDefs: [ typeDefs ],
  resolvers: [ resolver ],
  logger,
  jwt: { ... },
  database: { ... },
  serverOptions: {
    key: fs.readFileSync('/path/to/cert-key.pem'),
    cert: fs.readFileSync('/path/to/cert.pem'),
  },
  ...
});

// Запуск сервера
app.bootstrap();

```

Метод `bootstrap` запустит http сервер на базе [express-graphql](https://github.com/graphql/express-graphql) и web-socket сервер на базе [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws)