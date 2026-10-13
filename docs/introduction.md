# Введение

`@via-profit-services/core` — это HTTP-слой GraphQL-сервера. Само выполнение запросов делает эталонная реализация [graphql-js](https://github.com/graphql/graphql-js). Ядро берёт на себя всё, что происходит до и вокруг выполнения:

- разбор HTTP-запроса (JSON, GET-параметры, multipart с файлами, gzip/deflate/br);
- лимиты размеров, глубины и сложности;
- middleware и контекст;
- persisted queries;
- форматирование ошибок.

## Минимальный сервер

```ts
import http from 'node:http';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { graphqlHTTPFactory } from '@via-profit-services/core';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      sayHello: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: () => 'Hello',
      },
    },
  }),
});

// Фабрика вызывается ОДИН раз при старте приложения
const graphqlHTTP = graphqlHTTPFactory({ schema });

const server = http.createServer(async (req, res) => {
  // Обработчик вызывается на КАЖДЫЙ запрос
  const response = await graphqlHTTP(req, res);

  res.statusCode = response.errors && !response.data ? 400 : 200;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(response));
});

server.listen(8080);
```

Ответ на запрос `{ sayHello }`:

```json
{ "data": { "sayHello": "Hello" } }
```

С `debug: true` в ответ добавляется блок `extensions` со статистикой сервера:

```json
{
  "data": { "sayHello": "Hello" },
  "extensions": {
    "queryTime": 2.21,
    "requestCounter": 1,
    "startupTime": "2026-10-13T04:36:01.796Z"
  }
}
```

## С Express

Ядру нужен **непрочитанный** поток запроса. Не подключайте перед ним `express.json()` и другие парсеры тела.

```ts
import express from 'express';

const app = express();
const graphqlHTTP = graphqlHTTPFactory({ schema });

app.all('/graphql', async (req, res) => {
  const response = await graphqlHTTP(req, res);
  res.status(response.errors && !response.data ? 400 : 200).json(response);
});
```

## Путь запроса

```
HTTP-запрос
  │
  ├─ 1. Проверка метода (GET, POST, OPTIONS) и Content-Type
  │     (application/json или multipart/form-data)
  ├─ 2. CSRF-проверка (если csrfPrevention: true)
  ├─ 3. Middleware: по очереди, наполняют context
  ├─ 4. Чтение тела: JSON или multipart (файлы → временные файлы на диске)
  ├─ 5. Параметры: query / variables / operationName из URL или тела,
  │     persisted query по ключу
  ├─ 6. parse + стандартная валидация graphql-js (результат кэшируется по тексту запроса)
  ├─ 7. Лимиты глубины и сложности, правила из middleware
  ├─ 8. execute: резолверы получают context
  └─ 9. Ответ { data, errors, extensions } → ваш код отправляет его клиенту
        (временные файлы загрузок удаляются после закрытия ответа)
```

Ошибка на любом шаге прерывает обработку, и ядро возвращает `{ errors: [...] }`. Подробнее — в разделе [Ошибки](./guides/errors.md).

Обратите внимание, что **middleware выполняются до чтения тела**: в них доступны заголовки и URL, но не переменные запроса.

## Что дальше

- [Конфигурация](./guides/configuration.md): параметры и лимиты.
- [Контекст](./guides/context.md) и [Middleware](./guides/middlewares.md): авторизация, доступ к БД.
- [Безопасность](./guides/security.md): перед выкладкой в прод.
