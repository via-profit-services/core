# API

## Функции

### `graphqlHTTPFactory(props)`

Создаёт обработчик HTTP-запросов. Вызывается **один раз** при старте приложения.

```ts
import { graphqlHTTPFactory } from '@via-profit-services/core';

const graphqlHTTP: HTTPListener = graphqlHTTPFactory({ schema });
```

- **`props`**: `InitProps`. Все параметры описаны в разделе [Конфигурация](../guides/configuration.md).
- **Возвращает** `HTTPListener`.

### `HTTPListener(request, response)`

```ts
type HTTPListener = (
  request: http.IncomingMessage,
  response: http.ServerResponse,
) => Promise<GraphqlResponse>;
```

Обрабатывает один запрос и возвращает тело ответа. **Ответ не отправляется**: отправку, заголовки и сериализацию задаёт вызывающий код.

Рекомендуемый HTTP-статус находится в `response.status`. Это неперечисляемое свойство: оно не попадает в `JSON.stringify(response)`. См. [HTTP-статусы](../guides/errors.md#http-статусы).

```ts
const response = await graphqlHTTP(req, res);
res.statusCode = response.status ?? 200;
res.end(JSON.stringify(response));
```

`response` используется только для того, чтобы удалить временные файлы загрузок после закрытия ответа. В него ничего не пишется.

Обработчик никогда не отклоняет промис: любая ошибка возвращается в `errors`.

### `fieldsWrapper(schema, wrapper, options?)`

Оборачивает резолверы всех полей всех объектных типов схемы. Подходит для сквозной логики: проверки прав, логирования, метрик. **Изменяет переданную схему** и возвращает её же.

```ts
import { fieldsWrapper } from '@via-profit-services/core';
import { GraphQLError } from 'graphql';

fieldsWrapper(schema, ({ resolve, source, args, context, info }) => {
  const required = info.parentType.getFields()[info.fieldName].extensions?.requiredRole;

  if (required && !context.user?.roles.includes(required)) {
    return {
      resolve: () => {
        throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      },
    };
  }

  return {}; // ничего не меняем
});
```

`wrapper` получает `{ resolve, source, args, context, info }` и возвращает (синхронно или через Promise) объект с заменами любых из этих полей либо `{}`/`undefined`. Затем вызывается резолвер (исходный или заменённый) с итоговыми аргументами.

- Поля без своего резолвера используют `defaultFieldResolver` из graphql-js. В `resolve` передаётся именно он.
- Если `wrapper` возвращает обычное значение, а не Promise, резолвер вызывается синхронно. Для производительности не делайте `wrapper` асинхронным без необходимости.
- Опция `wrapWithoutResolvers: false` пропускает поля, у которых нет своего резолвера.
- Повторный вызов на той же схеме оборачивает поля ещё раз: выполнятся обе обёртки.

### `bodyParser({ request, response, config })`

Низкоуровневая функция: читает и разбирает тело запроса (JSON или multipart) и возвращает объект `{ query?, variables?, operationName?, … }`. Ядро вызывает её само; отдельно она нужна, только если вы строите свой обработчик. Применяет лимиты из `config.limits`.

## Скаляры, типы, интерфейсы

`DateTimeScalarType`, `MoneyScalarType`, `BigIntScalarType`, `TimeScalarType`, `EmailAddressScalarType`, `URLScalarType`, `JSONScalarType`, `JSONObjectScalarType`, `VoidScalarType`, `FileUploadScalarType`,
`BetweenDateTimeInputType`, `BetweenIntInputType`, `BetweenMoneyInputType`, `BetweenTimeInputType`,
`NodeInterfaceType`, `EdgeInterfaceType`, `ConnectionInterfaceType`, `ErrorInterfaceType`, `PageInfoType`, `OrderDirectionType`.

Описание — в разделе [Скаляры и типы](../guides/scalars.md).

## Константы

Значения лимитов по умолчанию — см. [Конфигурация → Лимиты](../guides/configuration.md#лимиты-limits).

| Константа | Значение |
|-----------|----------|
| `DEFAULT_PERSISTED_QUERY_KEY` | `'documentId'` |
| `DEFAULT_JSON_MAX_BYTES` | 1 МБ |
| `DEFAULT_JSON_DECOMPRESSED_MAX_BYTES` | 5 МБ |
| `DEFAULT_MAX_FIELD_SIZE` | 1 МБ |
| `DEFAULT_MAX_FILE_SIZE` | 10 МБ |
| `DEFAULT_MAX_FILE_TOTAL_SIZE` | 200 МБ |
| `DEFAULT_MAX_FILES` | 20 |
| `DEFAULT_MAX_FILE_FIELDS` | 6 |
| `DEFAULT_MAX_FILE_PARTS` | 26 |
| `DEFAULT_MAX_GRAPHQL_TOKENS` | 10 000 |
| `DEFAULT_MAX_GRAPHQL_DEPTH_LIMIT` | 10 |
| `DEFAULT_MAX_GRAPHQL_INTROSPECTION_DEPTH_LIMIT` | 20 |
| `DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIMIT` | 5000 |
| `DEFAULT_MAX_GRAPHQL_COMPLEXITY_FIELD_COST` | 1 |
| `DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIST_ARGUMENTS` | `['first', 'limit', 'take', 'pageSize', 'size']` |
| `DEFAULT_MAX_GRAPHQL_COMPLEXITY_DEFAULT_LIST_MULTIPLIER` | 1 |
| `DEFAULT_MAX_GRAPHQL_COMPLEXITY_INTROSPECTION_COST` | 2 |
| `DEFAULT_MAX_GRAPHQL_COMPLEXITY_MAX_FIELDS_PER_SELECTION` | 50 |
| `CSRF_PREVENTION_HEADERS` | `['x-requested-with', 'apollo-require-preflight', 'x-apollo-operation-name', 'graphql-preflight']` |

## Типы TypeScript

Все типы объявлены в модуле `@via-profit-services/core`.

| Тип | Описание |
|-----|----------|
| `InitProps` / `Configuration` | Параметры `graphqlHTTPFactory` |
| `Limits`, `ComplexityLimitOptions` | Лимиты |
| `HTTPListener` | Обработчик запроса |
| `GraphqlResponse` | `{ data?, errors?, extensions? }` и неперечисляемое `status` |
| `GraphQLExtensions`, `CoreStats` | Статистика: `queryTime`, `requestCounter`, `startupTime` |
| `Context` | Контекст. Пустой интерфейс, расширяется в проекте ([пример](../guides/context.md#типизация)) |
| `Middleware`, `MiddlewareProps` | Middleware |
| `ServerErrorType` | Значения `extensions.errorType` |
| `FilePayload` | Загруженный файл ([описание](../guides/file-uploads.md#filepayload)) |
| `UploadedFile` | `Promise<FilePayload>`: значение аргумента типа `FileUpload` |
| `PersistedQueriesMap` | `Record<string, string>` |
| `FieldsWrapper`, `ResolversWrapperFunction` | `fieldsWrapper` и его обёртка |
| `CursorConnection<T>`, `Edge<T>`, `Node<T>`, `PageInfo` | Структуры данных для [пагинации](../guides/connections.md) |
| `BetweenDateTime`, `BetweenInt`, `BetweenMoney`, `BetweenTime` | Значения input-типов «диапазон» |
