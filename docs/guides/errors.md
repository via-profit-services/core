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

Ядро формирует только тело ответа. HTTP-статус выставляет ваш код. Ниже — что рекомендуют актуальные документы и как это реализовать.

### Что говорят спецификации

- **Спецификация GraphQL** ([spec.graphql.org](https://spec.graphql.org)) не зависит от транспорта и ничего не говорит про HTTP-статусы.
- **GraphQL over HTTP** ([graphql.github.io/graphql-over-http](https://graphql.github.io/graphql-over-http/draft/)) — отдельная спецификация рабочей группы GraphQL Foundation, пока в статусе черновика (Working Draft):
  - в редакциях 2022 — первой половины 2026 года для ответов с `Content-Type: application/json` требовалось «SHOULD use the `200` status code, independent of any GraphQL request error or field error», то есть 200 на всё. Отсюда распространённое правило «GraphQL всегда отвечает 200»;
  - в июле 2026 года этот раздел удалён, и статусы теперь одинаковы для всех клиентов: при ошибке запроса — `4xx`/`5xx`, при частичном успехе — `2xx`.
- **Рекомендации на graphql.org** ([Serving over HTTP](https://graphql.org/learn/serving-over-http/)) звучат так же: `2xx`, если в ответе есть `data`, и обычно `400` при ошибке валидации.

### Рекомендуемое соответствие

| Ситуация | Признак в ответе ядра | Статус |
|----------|----------------------|--------|
| Успех | `data`, нет `errors` | `200` |
| Частичный успех / ошибки резолверов | `data` есть (даже `null`) и есть `errors` | `200` (черновик предлагает нестандартный `294`, см. ниже) |
| Синтаксис GraphQL, невалидный JSON, ошибки тела | `errorType: graphql-error-validate-request` | `400` |
| Ошибка валидации документа | `errorType: graphql-error-validate-field` | `400` (черновик GraphQL over HTTP рекомендует `422`) |
| Неподдерживаемый метод, мутация через GET | `errorType: graphql-error-execute` | `405` + заголовок `Allow: GET, POST` |
| Невалидная схема | `errorType: graphql-error-validate-schema` | `500` |
| Не аутентифицирован / нет доступа (ваш middleware) | `extensions.code: UNAUTHENTICATED` / `FORBIDDEN` | `401` / `403` |
| Неожиданная ошибка middleware | нет `data` и нет `errorType` | `500` |

**О статусе `294 Partial Success`.** Черновик рекомендует его для частичного успеха, но этот код не зарегистрирован в IANA и пока почти не поддерживается инфраструктурой: прокси, CDN, мониторингом. По RFC 9110 неизвестный клиенту `2xx` трактуется как `200`, но кэширование и метрики могут вести себя иначе. Пока безопаснее отвечать `200`.

**Почему частичный успех — это `2xx`, а не `4xx`/`5xx`.** Запрос корректен и выполнен, часть данных получена. Статус `500` заставил бы клиентов, прокси и балансировщики считать ответ сбоем (повторять запрос, выводить узел из ротации), хотя в теле есть полезные данные.

### Реализация

```ts
import type { GraphqlResponse } from '@via-profit-services/core';

const getHttpStatus = (response: GraphqlResponse): number => {
  // Запрос выполнялся: успех или частичный успех
  if (response.data !== undefined) {
    return 200;
  }

  const extensions = response.errors?.[0]?.extensions ?? {};

  switch (extensions.errorType) {
    case 'graphql-error-validate-request':
    case 'graphql-error-validate-field':
      return 400;
    case 'graphql-error-execute':
      return 405;
    case 'graphql-error-validate-schema':
      return 500;
  }

  switch (extensions.code) {
    case 'UNAUTHENTICATED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'BAD_USER_INPUT':
      return 400;
  }

  return 500;
};

server.on('request', async (req, res) => {
  const response = await graphqlHTTP(req, res);
  const status = getHttpStatus(response);

  res.statusCode = status;
  if (status === 405) {
    res.setHeader('Allow', 'GET, POST');
  }
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(response));
});
```

`errorType` объединяет несколько разных причин. Например, `graphql-error-validate-request` возвращается и для слишком большого тела (по спецификации `413`), и для неподдерживаемого `Content-Type` (`415`). Таблица выше даёт корректный, но более общий `400`.

### Клиенты

Apollo Client, urql и Relay корректно обрабатывают `4xx` с телом GraphQL-ответа: ошибки доступны через `networkError.result` (Apollo) или аналоги. Если какой-то клиент проекта рассчитывает на «всегда 200», проверьте его перед сменой статусов.

### Тип содержимого ответа

Черновик GraphQL over HTTP вводит тип `application/graphql-response+json`. Если клиент прислал `Accept: application/graphql-response+json`, сервер отвечает этим типом. Для старых клиентов, которые принимают только `application/json`, успешные (`2xx`) ответы отдаются с `Content-Type: application/json`. Большинство клиентов принимает `application/json` при любом статусе.
