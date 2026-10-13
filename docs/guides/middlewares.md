# Middleware

Middleware — функция, которую ядро вызывает на **каждый запрос** перед чтением тела и выполнением. Обычно с её помощью:

- наполняют [контекст](./context.md): пользователь, загрузчики, сервисы;
- проверяют заголовки (авторизация, версия клиента);
- добавляют правила валидации для текущего запроса;
- добавляют данные в `extensions` ответа (только при `debug: true`).

## Сигнатура

```ts
import type { Middleware } from '@via-profit-services/core';

const myMiddleware: Middleware = async props => {
  const { context, request, extensions, validationRule, schema, config, stats } = props;
  // ничего не возвращает: изменения вносятся в переданные объекты
};
```

| Свойство | Описание |
|----------|----------|
| `context` | Контекст текущего запроса. Своё у каждого запроса |
| `request` | `http.IncomingMessage`: заголовки, URL, метод. **Тело ещё не прочитано**, и читать его нельзя: оно нужно ядру |
| `extensions` | Объект `extensions` текущего запроса. Попадает в ответ только при `debug: true` |
| `validationRule` | Массив правил валидации текущего запроса. Добавленные правила действуют только на этот запрос |
| `schema` | Схема GraphQL (только для чтения) |
| `config` | Копия конфигурации ядра |
| `stats` | Копия статистики: `requestCounter`, `startupTime` |

## Порядок выполнения

Middleware выполняются **последовательно**, в порядке массива. Следующий начинается после завершения предыдущего (включая `await`), поэтому middleware может полагаться на данные, записанные предыдущими.

Если middleware бросает исключение, запрос прерывается, и клиент получает ошибку. При `maskErrors: true` клиент увидит `Internal server error`, если брошен не `GraphQLError`.

## Примеры

### Авторизация

```ts
import { GraphQLError } from 'graphql';
import type { Middleware } from '@via-profit-services/core';

const authMiddleware: Middleware = async ({ context, request }) => {
  const header = request.headers.authorization;

  if (!header) {
    context.user = null;

    return;
  }

  const user = await verifyToken(header.replace(/^Bearer /, ''));
  if (!user) {
    // GraphQLError: сообщение увидит клиент даже при maskErrors
    throw new GraphQLError('Invalid token', { extensions: { code: 'UNAUTHENTICATED' } });
  }

  context.user = user;
};
```

### Своё правило валидации

```ts
import { GraphQLError } from 'graphql';
import type { Middleware } from '@via-profit-services/core';

// Запрет мутаций для «только читающих» клиентов
const readOnlyMiddleware: Middleware = ({ request, validationRule }) => {
  if (request.headers['x-client'] !== 'read-only') {
    return;
  }

  validationRule.push(validationContext => ({
    OperationDefinition(node) {
      if (node.operation === 'mutation') {
        validationContext.reportError(new GraphQLError('Mutations are not allowed', { nodes: [node] }));
      }
    },
  }));
};
```

Правило действует только на текущий запрос, в следующем массив снова содержит лишь базовые правила.

### Логирование

```ts
const loggerMiddleware: Middleware = ({ request, stats }) => {
  logger.info(`#${stats.requestCounter} ${request.method} ${request.url}`);
};
```

## Подключение

```ts
const graphqlHTTP = graphqlHTTPFactory({
  schema,
  middleware: [loggerMiddleware, authMiddleware, readOnlyMiddleware],
});
```

## Типизация контекста

См. [Контекст → Типизация](./context.md#типизация).
