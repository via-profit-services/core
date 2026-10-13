# Ошибки

## Формат ответа

Обработчик всегда возвращает объект в формате [GraphQL response](https://spec.graphql.org/October2021/#sec-Response):

```ts
type GraphqlResponse = {
  data?: Record<string, unknown> | null;  // есть, если запрос дошёл до выполнения
  errors?: GraphQLFormattedError[];      // есть, если были ошибки
  extensions?: GraphQLExtensions;        // только при debug: true
};
```

По наличию `data` можно понять, на каком этапе возникла ошибка:

| Ответ | Что произошло |
|-------|---------------|
| `{ data }` | Успех |
| `{ data, errors }` | Запрос выполнен, но часть полей завершилась ошибкой (**частичный успех**). `data` может быть `null`, если ошибка «всплыла» до корня через non-null поля |
| `{ errors }` без `data` | Запрос **не выполнялся**: ошибка HTTP-запроса, разбора, валидации или middleware |

## Два вида ошибок

### Ошибки запроса (до выполнения)

Их формирует ядро. У каждой есть `extensions.errorType`:

| `errorType` | Когда |
|-------------|-------|
| `graphql-error-validate-request` | Неверный `Content-Type`, невалидный JSON, превышен размер тела, ошибка multipart, пустой запрос, синтаксическая ошибка GraphQL, превышен `maxGraphQLTokens`, CSRF-проверка, `persistedQueriesOnly`, значение переменной не прошло проверку типа или скаляра, неизвестный `operationName` |
| `graphql-error-validate-field` | Валидация документа: неизвестное поле, неверный тип аргумента, превышены глубина или сложность, правила из middleware |
| `graphql-error-execute` | Неподдерживаемый HTTP-метод; мутация через GET |
| `graphql-error-validate-schema` | Схема невалидна (ошибка разработчика) |

```json
{
  "errors": [
    {
      "message": "Cannot query field \"nmae\" on type \"User\". Did you mean \"name\"?",
      "locations": [{ "line": 1, "column": 10 }],
      "extensions": { "errorType": "graphql-error-validate-field" }
    }
  ]
}
```

### Ошибки выполнения (из резолверов)

graphql-js перехватывает исключение резолвера, записывает `null` в поле и добавляет ошибку с `path`:

```json
{
  "data": { "user": null },
  "errors": [{ "message": "User not found", "locations": [{ "line": 1, "column": 3 }], "path": ["user"] }]
}
```

Ошибки, которые должен увидеть клиент, бросайте как `GraphQLError` с кодом:

```ts
import { GraphQLError } from 'graphql';

throw new GraphQLError('Пользователь не найден', {
  extensions: { code: 'NOT_FOUND' },
});
```

## Маскирование (`maskErrors`)

Сообщение обычного `Error` может содержать внутренние детали: текст SQL, адреса серверов, логины. Если включить `maskErrors: true`, такие ошибки уходят клиенту в виде:

```json
{ "message": "Internal server error", "path": ["user"], "extensions": { "code": "INTERNAL_SERVER_ERROR" } }
```

| Ошибка | При `maskErrors: true` |
|--------|------------------------|
| `GraphQLError`, брошенная резолвером или middleware | Без изменений |
| Ошибки graphql-js (`Cannot return null for non-nullable field…`) | Без изменений |
| Ошибки запроса ядра (с `errorType`) | Без изменений |
| `Error`, ошибка драйвера БД и любое другое исключение | `Internal server error` |

Оригинальные ошибки получает `onError`. Его нужно подключить к логгеру, иначе ошибки потеряются:

```ts
graphqlHTTPFactory({
  schema,
  maskErrors: true,
  onError: error => logger.error({ err: error }, 'GraphQL error'),
});
```

`onError` вызывается для **каждой** ошибки ответа, включая ошибки валидации. Если нужны только неожиданные ошибки, отфильтруйте их: `if (!(error instanceof GraphQLError)) …`.

## Режим `debug`

При `debug: true` каждая ошибка получает `extensions.stacktrace` (массив строк), а ответ получает `extensions` со статистикой сервера. **Не включайте `debug` в проде**: стек раскрывает структуру кода.

## HTTP-статусы

Ядро вычисляет рекомендуемый HTTP-статус и возвращает его в поле `response.status`:

```ts
server.on('request', async (req, res) => {
  const response = await graphqlHTTP(req, res);

  res.statusCode = response.status ?? 200;
  if (res.statusCode === 405) {
    res.setHeader('Allow', 'GET, POST');
  }
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(response));
});
```

`status` — **неперечисляемое** свойство: `JSON.stringify(response)` и `{ ...response }` его не видят. Тело ответа по-прежнему содержит только `data`, `errors` и `extensions`, как требует спецификация GraphQL, а код, написанный для версий до 2.11, работает без изменений.

### Таблица статусов

| Статус | Когда |
|--------|-------|
| `200` | Операция выполнена. **В том числе с ошибками резолверов** и с `data: null` (частичный успех) |
| `400` | Невалидный JSON, пустой запрос, `variables` не объект, синтаксическая ошибка GraphQL, ошибка валидации (включая лимиты глубины и сложности), неверное значение переменной, неизвестный `operationName`, CSRF-проверка, `persistedQueriesOnly`, повреждённое multipart-тело |
| `401` / `403` | `GraphQLError` с `extensions.code` `UNAUTHENTICATED` / `FORBIDDEN`, брошенная до выполнения (в middleware) |
| `405` | Метод не GET/POST/OPTIONS; мутация через GET. Отправьте заголовок `Allow: GET, POST` |
| `413` | Превышен размер JSON-тела (в том числе после распаковки), размер файла, суммарный размер, количество файлов, полей или частей multipart |
| `415` | Неподдерживаемый `Content-Type` или `Content-Encoding`; POST без `Content-Type` |
| `500` | Невалидная схема; непредвиденное исключение в middleware |

### Свой статус из middleware

`GraphQLError`, брошенная до выполнения, может задать статус явно через `extensions.http.status` (то же соглашение, что в Apollo Server). Поле `http` используется только сервером и в ответ клиенту не попадает:

```ts
const rateLimitMiddleware: Middleware = async ({ request }) => {
  if (await isRateLimited(request)) {
    throw new GraphQLError('Too many requests', {
      extensions: { code: 'RATE_LIMITED', http: { status: 429 } },
    });
  }
};
```

Ошибки резолверов на статус не влияют: если операция выполнялась, статус `200`.

### Почему так: что говорят спецификации

- **Спецификация GraphQL** ([spec.graphql.org](https://spec.graphql.org)) не зависит от транспорта и ничего не говорит про HTTP-статусы.
- **GraphQL over HTTP** ([graphql.github.io/graphql-over-http](https://graphql.github.io/graphql-over-http/draft/)) — отдельная спецификация рабочей группы GraphQL Foundation, пока в статусе черновика (Working Draft):
  - в редакциях с 2022 по середину 2026 года для ответов с `Content-Type: application/json` требовалось «SHOULD use the `200` status code, independent of any GraphQL request error or field error», то есть 200 на всё. Отсюда распространённое правило «GraphQL всегда отвечает 200»;
  - в июле 2026 года этот раздел удалён, и статусы теперь одинаковы для всех клиентов: при ошибке запроса — `4xx`/`5xx`, при выполненной операции — `2xx`.
- **Рекомендации на graphql.org** ([Serving over HTTP](https://graphql.org/learn/serving-over-http/)) звучат так же: `2xx`, если в ответе есть `data`, и обычно `400` при ошибке валидации.

Ядро следует этим правилам с двумя осознанными отступлениями от последнего черновика:

| Ситуация | Черновик | Ядро | Почему |
|----------|----------|------|--------|
| Частичный успех (`data` и `errors`) | `294 Partial Success` | `200` | Код `294` добавлен в черновик в 2026 году и не зарегистрирован в IANA. Прокси, CDN и мониторинг могут обрабатывать его неожиданно |
| Ошибка валидации документа | `422` | `400` | Так поступают graphql.org, Apollo Server и большинство клиентов. Если нужен `422`, замените статус для `extensions.errorType === 'graphql-error-validate-field'` |

**Почему частичный успех — это `2xx`, а не `4xx`/`5xx`.** Запрос корректен и выполнен, часть данных получена. Статус `500` заставил бы клиентов, прокси и балансировщики считать ответ сбоем (повторять запрос, выводить узел из ротации), хотя в теле есть полезные данные.

### Клиенты

Apollo Client, urql и Relay корректно обрабатывают `4xx` с телом GraphQL-ответа: ошибки доступны через `networkError.result` (Apollo) или аналоги. Если какой-то клиент проекта рассчитывает на «всегда 200», проверьте его перед сменой статусов.

### Тип содержимого ответа

Черновик GraphQL over HTTP вводит тип `application/graphql-response+json`. Если клиент прислал `Accept: application/graphql-response+json`, сервер отвечает этим типом. Для старых клиентов, которые принимают только `application/json`, успешные (`2xx`) ответы отдаются с `Content-Type: application/json`. Большинство клиентов принимает `application/json` при любом статусе.
