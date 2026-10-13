# Конфигурация

Все параметры передаются в `graphqlHTTPFactory` один раз при старте приложения.

```ts
import { graphqlHTTPFactory } from '@via-profit-services/core';

const graphqlHTTP = graphqlHTTPFactory({
  schema,              // обязательный
  middleware: [],
  debug: false,
  limits: { /* ... */ },
});
```

## Основные параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `schema` | `GraphQLSchema` | — | **Обязательный.** Схема GraphQL |
| `middleware` | `Middleware \| Middleware[]` | `[]` | Функции, выполняемые на каждый запрос перед чтением тела. См. [Middleware](./middlewares.md) |
| `rootValue` | `unknown` | `undefined` | Передаётся в `execute` graphql-js как есть |
| `debug` | `boolean` | `false` | Добавляет в ответ `extensions` (время запроса, счётчик, время старта) и `stacktrace` в ошибки. **Не включайте в проде** |
| `persistedQueriesMap` | `Record<string, string>` | `undefined` | Карта «идентификатор → текст запроса». См. [Persisted Queries](./persisted-queries.md) |
| `persistedQueryKey` | `string` | `'documentId'` | Имя параметра с идентификатором persisted query |
| `limits` | `Limits` | см. ниже | Лимиты размеров, глубины и сложности |

## Безопасность

Подробное объяснение — в разделе [Безопасность](./security.md).

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `maskErrors` | `boolean` | `false` | Ошибки, которые не являются `GraphQLError`, уходят клиенту как `Internal server error` |
| `onError` | `(error: Error) => void` | — | Получает оригинал каждой ошибки ответа (до маскирования). Для логирования |
| `csrfPrevention` | `boolean` | `false` | GET- и multipart-запросы должны содержать заголовок из `CSRF_PREVENTION_HEADERS` |
| `persistedQueriesOnly` | `boolean` | `false` | Принимать только запросы из `persistedQueriesMap` |
| `introspection` | `boolean` | `true` | `false` запрещает `__schema` и `__type` (`__typename` работает всегда) |
| `sharedContext` | `boolean` | `false` | **Устаревший режим**: один объект контекста на все запросы. См. [Контекст](./context.md#общий-контекст-sharedcontext) |

## Лимиты (`limits`)

Каждый лимит можно переопределить отдельно, остальные сохранят значения по умолчанию. Значения по умолчанию экспортируются как константы (колонка «Константа»).

### Тело запроса

| Лимит | По умолчанию | Константа | Описание |
|-------|--------------|-----------|----------|
| `maxJSONBodySize` | 1 МБ | `DEFAULT_JSON_MAX_BYTES` | Размер JSON-тела «на проводе» (до распаковки) |
| `maxJSONBodyDecompressedSize` | 5 МБ | `DEFAULT_JSON_DECOMPRESSED_MAX_BYTES` | Размер после распаковки gzip/deflate/br. Защита от gzip-бомб |

### Загрузка файлов (multipart)

| Лимит | По умолчанию | Константа | Описание |
|-------|--------------|-----------|----------|
| `maxFileSize` | 10 МБ | `DEFAULT_MAX_FILE_SIZE` | Размер одного файла |
| `maxFilesTotalSize` | 200 МБ | `DEFAULT_MAX_FILE_TOTAL_SIZE` | Суммарный размер файлов в запросе |
| `maxFiles` | 20 | `DEFAULT_MAX_FILES` | Количество файлов |
| `maxFileFields` | 6 | `DEFAULT_MAX_FILE_FIELDS` | Количество НЕ-файловых полей (`operations`, `map`…) |
| `maxFileParts` | 26 | `DEFAULT_MAX_FILE_PARTS` | Количество частей всего (файлы + поля) |
| `maxFieldSize` | 1 МБ | `DEFAULT_MAX_FIELD_SIZE` | Размер значения НЕ-файлового поля (`operations`, `map`) |

Все лимиты проверяются **по мере чтения**: запрос отклоняется на первом же превышении, не дожидаясь конца тела.

### Запрос GraphQL

| Лимит | По умолчанию | Константа | Описание |
|-------|--------------|-----------|----------|
| `maxGraphQLTokens` | 10 000 | `DEFAULT_MAX_GRAPHQL_TOKENS` | Количество токенов в документе. Парсер останавливается на превышении |
| `maxGraphQLDepthLimit` | 10 | `DEFAULT_MAX_GRAPHQL_DEPTH_LIMIT` | Глубина вложенности полей. `0` отключает проверку |
| `maxGraphQLIntrospectionDepthLimit` | 20 | `DEFAULT_MAX_GRAPHQL_INTROSPECTION_DEPTH_LIMIT` | Глубина внутри `__schema`/`__type`. Стандартный introspection-запрос имеет глубину 14 |
| `complexityLimit` | см. ниже | — | Ограничение «стоимости» запроса |

### `complexityLimit`

| Параметр | По умолчанию | Константа | Описание |
|----------|--------------|-----------|----------|
| `maxComplexity` | 5000 | `DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIMIT` | Максимальная сложность операции. `0` отключает проверку |
| `fieldCost` | 1 | `DEFAULT_MAX_GRAPHQL_COMPLEXITY_FIELD_COST` | Стоимость одного поля |
| `listArguments` | `['first', 'limit', 'take', 'pageSize', 'size']` | `DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIST_ARGUMENTS` | Аргументы, задающие размер списка. Значение (литерал или переменная) умножает стоимость поля |
| `defaultListMultiplier` | 1 | `DEFAULT_MAX_GRAPHQL_COMPLEXITY_DEFAULT_LIST_MULTIPLIER` | Множитель для полей-списков без аргумента размера. `1` — без множителя |
| `introspectionCost` | 2 | `DEFAULT_MAX_GRAPHQL_COMPLEXITY_INTROSPECTION_COST` | Стоимость поля внутри `__schema`/`__type` |
| `maxFieldsPerSelection` | 50 | `DEFAULT_MAX_GRAPHQL_COMPLEXITY_MAX_FIELDS_PER_SELECTION` | Максимум полей в одном блоке `{ }` |
| `onComplete` | — | — | `(complexity: number) => void`, вызывается с итоговой сложностью каждой операции |
| `createError` | — | — | `(max, actual) => GraphQLError`, своя ошибка при превышении |

Как считается сложность:

```
стоимость поля = (fieldCost + стоимость вложенных полей) × множитель списка
```

```graphql
query {
  users(first: 100) {       # (1 + 21) × 100 = 2200
    name                    #  1
    posts(first: 10) {      # (1 + 1) × 10 = 20
      title                 #  1
    }
  }
}
# итого: 2200
```

Фрагмент учитывается столько раз, сколько раз он упомянут: столько раз он и будет выполнен.

## Пример полной конфигурации

```ts
const graphqlHTTP = graphqlHTTPFactory({
  schema,
  middleware: [authMiddleware, dbMiddleware],
  debug: process.env.NODE_ENV === 'development',
  maskErrors: true,
  onError: error => logger.error(error),
  csrfPrevention: true,
  introspection: process.env.NODE_ENV !== 'production',
  limits: {
    maxFileSize: 50 * 1024 * 1024,
    maxFilesTotalSize: 100 * 1024 * 1024,
    maxGraphQLDepthLimit: 12,
    complexityLimit: {
      maxComplexity: 10_000,
      onComplete: complexity => metrics.observe('graphql_complexity', complexity),
    },
  },
});
```
