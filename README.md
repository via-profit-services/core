# @via-profit-services/core — серверное ядро GraphQL

## Введение

`@via-profit-services/core` представляет собой минималистичное, производительное и расширяемое серверное ядро GraphQL.
Оно включает поддержку multipart-загрузок, Persisted Queries, систему middleware.

## Установка

```
npm install @via-profit-services/core
```

## Быстрый старт

```ts
import { graphqlHTTPFactory } from '@via-profit-services/core';
import schema from './schema';

// создание http сервера
const server = http.createServer();

// инициализация graphQL ядра
const graphqlHTTP = graphqlHTTPFactory({
  schema,
});

// обработка входящих запросов
server.on('request', async (req, res) => {
  // POST или GET на url /graphql
  if (['POST', 'GET'].includes(req.method) && req.url.match(/^\/graphql/)) {
    
    // обработка запроса
    const { data, errors, extensions } = await graphqlHTTP(req, res);
    
    // формирование ответа
    const response = JSON.stringify({ data, errors, extensions });
    
    // создание стрима для ответа
    const stream = Readable.from([response]);

    // для примера статус-код всегда 200 OK
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');

    // отправка ответа
    stream.pipe(res);
  }
});

server.listen(8081, 'localhost', () => {
  console.debug('started at http://localhost:8081/graphql');
});
```

## Конфигурация

Основной объект конфигурации передается в `graphqlHTTPFactory` и включает следующие параметры:

### schema

GraphQL-схема. Обязательный параметр.

### persistedQueriesMap

Карта Persisted Queries. Если передана, сервер будет использовать её вместо текстового запроса.

### persistedQueryKey

Имя параметра, содержащего ID запроса в карте Persisted Queries.  
По умолчанию: `documentId`.

### debug

Режим отладки.  
По умолчанию: `false`.

### rootValue

Значение, передаваемое в `execute` из пакета `graphql`.

### middleware

Массив middleware-функций, выполняемых перед обработкой запроса.

### limits

Объект ограничений, описанный ниже.

---

## Ограничения (limits)

Секция `limits` позволяет контролировать размеры входящих данных, глубину и сложность GraphQL-запросов, а также
параметры multipart-загрузки.

### Ограничения multipart / загрузки файлов

- **maxFieldSize** — максимальный размер текстового поля в multipart (байты).
- **maxFileSize** — максимальный размер одного файла.
- **maxFiles** — максимальное количество файлов.
- **maxFileFields** — максимальное количество полей-файлов.
- **maxFileParts** — максимальное количество частей формы.
- **maxFilesTotalSize** — максимальный суммарный размер файлов.

### Ограничения JSON

- **JSONMaxBytes** — максимальный размер JSON-тела запроса.

### Ограничения глубины GraphQL

- **maxGraphQLDepthLimit** — максимальная глубина обычных запросов.
- **maxGraphQLIntrospectionDepthLimit** — максимальная глубина introspection-запросов.

---

## Ограничение сложности GraphQL (complexity-limit)

Complexity-limit защищает сервер от чрезмерно дорогих запросов.  
Сложность вычисляется по формуле:

```
fieldComplexity = (fieldCost + childComplexity) * listMultiplier
```

### Пример

```
query {
  users(first: 100) {
    posts(first: 50) {
      comments(first: 20) {
        id
      }
    }
  }
}
```

Этот запрос имеет сложность около **205100** и будет отклонён при лимите **5000**.

### Параметры complexityLimit

- **maxComplexity** — максимальная суммарная сложность запроса.
- **fieldCost** — базовая стоимость каждого поля.
- **listArguments** — аргументы, влияющие на размер списка.
- **defaultListMultiplier** — множитель по умолчанию, если аргумент списка не указан.
- **introspectionCost** — дополнительная стоимость introspection-полей.
- **maxFieldsPerSelection** — ограничение ширины selectionSet.
- **onComplete** — callback после вычисления сложности.
- **createError** — фабрика ошибки.

---

## Пример конфигурации

```ts
const app = graphqlHTTPFactory({
  schema,
  limits: {
    maxFieldSize: 16 * 1024 * 1024,
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 20,
    maxFileFields: 2,
    maxFileParts: 20,
    maxFilesTotalSize: 200 * 1024 * 1024,
    JSONMaxBytes: 1 * 1024 * 1024,
    maxGraphQLDepthLimit: 10,
    maxGraphQLIntrospectionDepthLimit: 10,
    complexityLimit: {
      maxComplexity: 5000,
      fieldCost: 1,
      listArguments: ['first', 'limit', 'take', 'pageSize', 'size'],
      defaultListMultiplier: 1,
      introspectionCost: 2,
      maxFieldsPerSelection: 50,
    },
  },
});
```

---

## Middleware

Сервер поддерживает цепочку middleware, которые могут изменять контекст, выполнять валидацию, логирование и другие
задачи.
Отлично, Vasily — добавим полноценный, практичный и понятный раздел **«Пример использования Middleware»**, который
впишется в твой README в том же стиле, что и остальные разделы.

## Пример использования Middleware

Middleware выполняются перед обработкой GraphQL‑запроса.  
Каждое middleware получает доступ к:

- конфигурации сервера
- статистике
- HTTP‑запросу
- GraphQL‑схеме
- контексту
- массиву validation rules
- объекту extensions (можно добавлять свои поля)

Middleware может:

- модифицировать контекст
- добавлять данные в extensions
- выполнять логирование
- прерывать выполнение, выбрасывая ошибку
- изменять validation rules (например, добавлять свои правила)

### Простой пример: логирование запросов

```ts
import type { Middleware } from '@via-profit-services/core';

const loggerMiddleware: Middleware = async ({ request, extensions }) => {
  const start = Date.now();

  // Можно добавить свои данные в extensions
  extensions.requestStart = start;

  console.log(`[REQUEST] ${request.method} ${request.url}`);
};
```

### Пример: добавление пользовательского контекста

```ts
import type { Middleware } from '@via-profit-services/core';

const authMiddleware: Middleware = async ({ context, request }) => {
  const token = request.headers['authorization'];

  context.user = token === 'secret' ? { id: '1', role: 'admin' } : null;
};
```

Теперь в любом резолвере:

```ts
resolve: (_src, _args, context) => {
  if (!context.user) {
    throw new Error('Unauthorized');
  }

  return 'private data';
}
```

### Пример: добавление кастомного validation rule

```ts
import { GraphQLError } from 'graphql';
import type { Middleware } from '@via-profit-services/core';

const denyMutationMiddleware: Middleware = async ({ validationRule }) => {
  validationRule.push(context => ({
    OperationDefinition(node) {
      if (node.operation === 'mutation') {
        context.reportError(new GraphQLError('Mutations are disabled'));
      }
    },
  }));
};
```

### Подключение middleware

```ts
import { graphqlHTTPFactory } from '@via-profit-services/core';

const app = graphqlHTTPFactory({
  schema,
  middleware: [
    loggerMiddleware,
    authMiddleware,
    denyMutationMiddleware,
  ],
});
```

---

## Persisted Queries

Persisted Queries позволяют клиенту отправлять на сервер не полный текст GraphQL‑запроса, а только его идентификатор.
Это снижает сетевые расходы, ускоряет выполнение и повышает безопасность, поскольку сервер не принимает произвольные
запросы, а использует заранее подготовленную карту запросов.

Включение Persisted Queries

```ts
import { graphqlHTTPFactory } from '@via-profit-services/core';

const persistedQueriesMap = {
  getUser: `
    query {
      user {
        id
        name
      }
    }
  `,
};

const app = graphqlHTTPFactory({
  schema,
  persistedQueriesMap,
  persistedQueryKey: 'documentId', // можно изменить
});

```

Изменение имени ключа
Если клиент использует другое имя параметра, например hash, можно указать:

```ts
const app = graphqlHTTPFactory({
  schema,
  persistedQueriesMap,
  persistedQueryKey: 'hash',
});
```

---

## Обработка ошибок

Ядро использует единый механизм обработки ошибок, основанный на стандарте GraphQL и расширенный собственным типом ошибок сервера.
Это позволяет получать предсказуемые, структурированные ответы и при необходимости настраивать формат ошибок.

### Типы ошибок

Существует два основных типа ошибок:

### 1. Ошибки GraphQL (GraphQLError)

Возникают:
- при ошибках валидации схемы;
- при ошибках валидации запроса;
- при ошибках выполнения резолверов;
- при пользовательских ошибках, выброшенных в резолверах.

Пример ошибки в резолвере:
```ts
resolve() {
  throw new Error('User not found');
}
```

Ответ сервера:
```json
{
  "data": null,
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"]
    }
  ]
}
```

### 2. ServerError (ошибки уровня ядра)

Используются для ошибок, связанных:
- с валидацией запроса до выполнения;
- с нарушением лимитов (depth, complexity, размеры файлов);
- с ошибками парсинга тела запроса;
- с ошибками multipart‑загрузки.

ServerError содержит:
- массив GraphQLError;
- тип ошибки (`graphql-error-execute`, `graphql-error-validate-field`, `graphql-error-validate-request`, `graphql-error-validate-schema`).

Пример:
```
Query complexity 205100 exceeds the maximum allowed complexity of 5000.
```

---

## Формат ответа

Все ошибки возвращаются в стандартном GraphQL‑формате:

```json
{
  "data": null,
  "errors": [
    {
      "message": "...",
      "extensions": {
        "code": "GRAPHQL_VALIDATION_FAILED",
        "details": { ... }
      }
    }
  ],
  "extensions": {
    "queryTime": 12,
    "requestCounter": 42,
    "startupTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### Поле `extensions`

Содержит:
- статистику запроса;
- дополнительные данные, добавленные middleware;
- расширения ошибок.

---

## Ошибки, связанные с лимитами

### Превышение глубины
```
'Query' Query depth 15 exceeds the maximum allowed depth of 10.
```

### Превышение сложности
```
'Query' Query complexity 205100 exceeds the maximum allowed complexity of 5000.
```

### Превышение размера JSON
```
JSON body exceeds maximum allowed size of 1048576 bytes.
```

### Ошибки multipart‑загрузки
```
File size limit exceeded: max 10MB
```

---

## Кастомизация ошибок

### Кастомизация ошибок complexity-limit

```ts
complexityLimit: {
  maxComplexity: 5000,
  createError: (max, actual) =>
    new GraphQLError(`Too expensive: ${actual} > ${max}`)
}
```

### Кастомизация ошибок через middleware

```ts
const errorMiddleware = async ({ extensions }) => {
  extensions.onError = (err) => {
    console.error('GraphQL error:', err.message);
  };
};
```

### Кастомизация ошибок в резолверах

```ts
import { GraphQLError } from 'graphql';

resolve() {
  throw new GraphQLError('Access denied', {
    extensions: { code: 'FORBIDDEN' }
  });
}
```

---

## Пример: глобальный перехват ошибок

```ts
const logErrorsMiddleware = async ({ extensions }) => {
  extensions.onError = (error) => {
    console.log('[GraphQL Error]', error.message);
  };
};

const app = graphqlHTTPFactory({
  schema,
  middleware: [logErrorsMiddleware],
});
```

## Лицензия

MIT License

Copyright (c) 2024 Via Profit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

