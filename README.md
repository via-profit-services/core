# @via-profit-services/core

Серверное ядро GraphQL для Node.js. Принимает HTTP-запрос, разбирает его по спецификации [GraphQL over HTTP](https://graphql.github.io/graphql-over-http/) и выполняет через [graphql-js](https://github.com/graphql/graphql-js).

- Без runtime-зависимостей: только `graphql` как peer-зависимость.
- Работает с любым HTTP-сервером: `node:http`, Express, Koa и т. п.
- Загрузка файлов по [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec). Файлы читаются потоком, а лимиты проверяются прямо во время приёма.
- Middleware для наполнения контекста, свои правила валидации.
- Защита: лимиты глубины, сложности и размеров запроса, маскирование ошибок, защита от CSRF, persisted queries.
- Готовые скаляры (`DateTime`, `Money`, `BigInt`, `JSON`, `FileUpload`…) и типы для Relay-пагинации.

## Установка

```bash
npm install @via-profit-services/core graphql
```

Требуется Node.js 18.18 или новее (рекомендуется 20+) и `graphql` версии 16.

## Быстрый старт

```ts
import http from 'node:http';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import { graphqlHTTPFactory } from '@via-profit-services/core';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: { type: GraphQLString, resolve: () => 'world' },
    },
  }),
});

const graphqlHTTP = graphqlHTTPFactory({ schema });

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/graphql')) {
    res.statusCode = 404;
    res.end();

    return;
  }

  const response = await graphqlHTTP(req, res);

  res.statusCode = response.status ?? 200; // рекомендуемый статус, вычисленный ядром
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(response));       // status в тело не попадает
});

server.listen(8080, () => console.log('http://localhost:8080/graphql'));
```

```bash
curl -X POST http://localhost:8080/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ hello }"}'
# {"data":{"hello":"world"}}
```

Ядро только формирует ответ и не отправляет его. Рекомендуемый HTTP-статус ядро возвращает в `response.status`, а отправку ответа и заголовки задаёт ваш код: так ядро встраивается в любой сервер. Подробнее о статусах — в разделе [Ошибки](./docs/guides/errors.md#http-статусы).

## Документация

| Раздел | О чём |
|--------|-------|
| [Введение](./docs/introduction.md) | Как устроено ядро и путь запроса |
| [Конфигурация](./docs/guides/configuration.md) | Все параметры и лимиты со значениями по умолчанию |
| [Контекст](./docs/guides/context.md) | Объект контекста и его жизненный цикл |
| [Middleware](./docs/guides/middlewares.md) | Наполнение контекста, свои правила валидации |
| [Загрузка файлов](./docs/guides/file-uploads.md) | Протокол, лимиты, временные файлы, прогресс загрузки |
| [Скаляры и типы](./docs/guides/scalars.md) | `DateTime`, `Money`, `Time`, `BigInt`, `JSON`… |
| [Пагинация (Connections)](./docs/guides/connections.md) | Курсорная пагинация по спецификации Relay |
| [Ошибки](./docs/guides/errors.md) | Формат ошибок, HTTP-статусы, маскирование |
| [Persisted Queries](./docs/guides/persisted-queries.md) | Запросы по идентификатору |
| [Безопасность](./docs/guides/security.md) | Лимиты, CSRF, маскирование, рекомендуемая конфигурация для прода |
| [API](./docs/api/api.md) | Справочник экспортов пакета |
| [Миграция на 2.12](./docs/guides/migration-2.12.md) | Что изменилось и что проверить в проекте |
| [CHANGELOG](./CHANGELOG.md) | История версий |

## Рекомендуемая конфигурация для продакшена

```ts
const graphqlHTTP = graphqlHTTPFactory({
  schema,
  middleware: [authMiddleware],
  maskErrors: true,                                     // клиент не видит внутренние ошибки
  onError: error => logger.error(error),                // а сервер их логирует
  csrfPrevention: true,                                 // если авторизация на cookie
  introspection: process.env.NODE_ENV !== 'production',
});
```

Подробности и объяснение каждого пункта — в разделе [Безопасность](./docs/guides/security.md).

## Лицензия

[MIT](./LICENSE) © Via Profit
