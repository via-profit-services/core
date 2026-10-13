# CHANGELOG

## 2.12.0

Исправлены ошибки и уязвимости, найденные при аудите, и добавлены функции для курсорной пагинации. Публичный API не изменился; новые параметры и функции необязательны. Некоторые изменения поведения требуют проверки проектов: см. [руководство по миграции](./docs/guides/migration-2.12.md).

Версия 2.11.0 не публиковалась: её изменения вошли в 2.12.0.

### Extensions

Подробности в разделе [Extensions](./docs/guides/extensions.md).

- `extensions` есть в каждом ответе: `requestId` и поля проекта отправляются всегда, статистика и диагностика сервера — только при `debug`. **Маршруты проектов должны передавать `extensions` как есть** (без `debug ? extensions : undefined`).
- `setExtension(context, name, value)`: поле в `extensions` из резолвера. `getRequestId(context)`: ID запроса для логов. Константа `RESERVED_EXTENSIONS`.
- `requestId`: из заголовка `X-Request-Id`, если это безопасная строка, иначе случайный UUID.
- Замеры лимитов: `extensions.limits` (`limits.exposeUsage` или `debug`) и `limits.onUsage(usage, context)` для сбора статистики в проде. Измеряются размер тела, файлы, токены, глубина, сложность и ширина запроса, в том числе отклонённого лимитом.
- `debug`: `extensions.diagnostics` — имя операции, persisted query, попадание в кэш документов, время по этапам.
- `complexityLimit.onComplete` получает второй аргумент `{ operationName, width }`.
- Исправлено: `extensions.requestCounter` показывал значение глобального счётчика на момент ответа, а не номер запроса (при параллельных запросах номера совпадали).
- `validationRule` в middleware изначально пуст: правила глубины и сложности применяются ядром отдельно.

### Пагинация

Функции для курсорной пагинации. Раньше каждый проект держал свою копию этой логики в `BaseService`, и копии разошлись: подписанный курсор и защита фильтров от подмены были только в biotransfer. Подробности в разделе [Пагинация](./docs/guides/connections.md).

- `createCursorCodec({ secret })`: подписанные курсоры (HMAC-SHA256). Клиент может прочитать курсор, но не может его изменить.
- `parseConnectionArgs(args, filters, { codec, maxPageSize })`: проверка `first`/`last`/`after`/`before`/`offset`, расчёт `limit`/`offset`, слияние фильтров с курсором. Явно переданные фильтры важнее фильтров из курсора, поэтому ограничения сервера нельзя заменить курсором.
- `buildConnection(nodes, { cursor, codec, hasPreviousPage, hasNextPage })`: `edges` и `pageInfo`.
- Ошибки аргументов и курсора — `GraphQLError` с кодом `BAD_USER_INPUT`: их не скрывает `maskErrors`.

По сравнению с копиями в проектах исправлено:
- `last` + `before` возвращал не только записи перед курсором, но и саму запись курсора и записи после неё, если перед курсором было меньше `last` записей;
- `first: 0` отклонялся как «не передан»;
- `first` + `before` молча игнорировал `before`; теперь это ошибка, как и `last` + `after`;
- сообщение при `after` + `before` говорило «Missing…»;
- подписанный курсор без корректного `offset` не отклонялся;
- нет ограничения размера страницы: добавлен `maxPageSize`.

### Безопасность

- **Контекст создаётся на каждый запрос.** Раньше `context`, `extensions` и `validationRule` были общими для всех запросов: данные одного пользователя могли попасть в резолверы другого, а правила, добавленные middleware, накапливались бесконечно. Прежнее поведение доступно через устаревший параметр `sharedContext: true`.
- **Prototype pollution через поле `map`** multipart-запроса: путь `variables.__proto__.*` позволял одним запросом изменить `Object.prototype` всего процесса.
- **Загрузка файлов**: тело запроса целиком накапливалось в памяти, лимиты `maxFileSize`, `maxFiles`, `maxFileFields`, `maxFileParts` не применялись.
- **Валидация**: правила глубины и сложности работали экспоненциально долго на запросах с многократно вложенными фрагментами (запрос в 1 КБ блокировал сервер на секунды).
- **Обход лимита сложности** через переменные (`first: $n`), аргумент `last`, значение аргумента по умолчанию в схеме и повторное использование фрагментов.
- **Утечка памяти** в правилах валидации (кэш фрагментов всех запросов).
- `extensions` со статистикой сервера возвращались при `debug: false`.

### Новое

- `response.status`: рекомендуемый HTTP-статус ответа (`200`, `400`, `401`, `403`, `405`, `413`, `415`, `500`). Неперечисляемое свойство: не попадает в `JSON.stringify(response)`, поэтому тело ответа не меняется. `GraphQLError` из middleware может задать статус через `extensions.http.status`; поле `http` клиенту не отправляется.
- `maskErrors` и `onError`: скрытие внутренних ошибок от клиента и их логирование.
- `csrfPrevention`: защита от CSRF для GET- и multipart-запросов. Константа `CSRF_PREVENTION_HEADERS`.
- `persistedQueriesOnly`: выполнять только persisted queries.
- `introspection`: возможность запретить introspection.
- `limits.maxGraphQLTokens` (по умолчанию 10 000), константа `DEFAULT_MAX_GRAPHQL_TOKENS`.
- Работают все параметры `complexityLimit`: `listArguments`, `defaultListMultiplier`, `introspectionCost`, `maxFieldsPerSelection`, `onComplete`, `createError`.
- Поддержка `Content-Encoding: br`.
- Кэш разобранных и провалидированных документов: +39% запросов в секунду, +110% при использовании `fieldsWrapper`.

### Исправления

- Новый потоковый multipart-парсер: разделитель, разрезанный между TCP-пакетами, больше не теряется (раньше файлы портились или запрос зависал); файлы пишутся на диск с обратным давлением; запрос больше не зависает, если файл из `map` не пришёл; поддержаны boundary в кавычках и `filename*`.
- Временные файлы загрузок удаляются автоматически после закрытия ответа; создаются с правами `0600`.
- Глубина: фрагменты не добавляют уровень; `maxGraphQLIntrospectionDepthLimit` применяется (раньше игнорировался, и стандартный introspection-запрос отклонялся).
- `fieldsWrapper`: поля без резолвера возвращали `null`; `wrapWithoutResolvers: false` отключал обёртку всех полей; синхронный путь без лишних Promise.
- Невалидный JSON в теле запроса больше не превращается молча в пустой запрос; `variables` обязаны быть объектом; batch-запросы отклоняются явно.
- Обрыв запроса или повреждённый gzip больше не оставляют запрос висеть.
- `maxJSONBodyDecompressedSize` применялся и к несжатому телу: при `maxJSONBodySize` больше 5 МБ тело всё равно отклонялось на 5 МБ.
- Ошибки значений переменных возвращаются как ошибки запроса (`graphql-error-validate-request`) и не маскируются.
- Сообщение о неверном `Content-Type` содержало `[object Object]`.
- Скаляры: `DateTime` — на входе только ISO 8601 (с зоной или без, как отправляют мобильные приложения) и реальные даты, timestamp до 2001 года больше не отклоняются; `Money` — только десятичные целые строки (`""` и `"0x10"` принимались); `Time` — `24:59` отклоняется, вывод всегда `HH:MM:SS`; `URL` — запрещены `javascript:` и `vbscript:`; `BigInt` — ошибки в виде `GraphQLError`; `JSONObject` — литерал обязан быть объектом.

### Изменены значения по умолчанию

- `DEFAULT_MAX_FIELD_SIZE`: 16 МБ → 1 МБ.
- `DEFAULT_MAX_FILE_PARTS`: 20 → 26 (`maxFiles` + `maxFileFields`).
- `DEFAULT_MAX_GRAPHQL_INTROSPECTION_DEPTH_LIMIT`: 8120 → 20.
- `DEFAULT_MAX_GRAPHQL_DEPTH_LIMIT`: 10 → 20. Значение, которое все проекты и так задавали в конфиге.
- `DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIMIT`: 5000 → 50 000. Сложность теперь считается честно (с переменными), и 5000 отклоняли реальные запросы CRM. Значение подобрано по 443 операциям клиентов biotransfer.
- `DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIST_ARGUMENTS`: добавлен `last`.
- `maxFieldsPerSelection` (50) теперь применяется.

### Прочее

- `engines.node >= 18.18`; `types` в карте `exports`; в npm-пакет попадают только `dist`, README, CHANGELOG, LICENSE.
- Из типов удалены `CoreService` и `BetweenDateInputType`: они не существовали в рантайме. `BetweenMoney` использует `bigint`.
- Документация переписана и приведена в соответствие с кодом.

## 2.10.0 (17.04.2026)

- Сборка ESM и CommonJS (`"type": "module"`, `exports`).
- Большой рефакторинг ядра.
- `DateTime` снова принимает строки без часового пояса: их отправляют мобильные приложения.
- 2.10.1–2.10.6: исправления multipart-парсера и проверки `Content-Type`.

## 2.8.0 (26.01.2026)

- Лимиты размеров тела, файлов, глубины (`maxGraphQLDepthLimit`) и сложности (`complexityLimit`) запроса.
- Собственный multipart-парсер вместо `busboy`: пакет больше не имеет runtime-зависимостей.
- 2.8.1 (05.03.2026): `DateTime` принимает только ISO-UTC.

## 2.7.0 (13.12.2024)

### Ломающие изменения

- Скаляр `Money` теперь использует `bigint`, а не `number`.

## 2.6.0 (02.11.2024)

### Ломающие изменения

- `Context` теперь пустой объект.

## 2.5.0 (08.08.2024)

- `graphql` обновлён до 16.9.0.
- Методы `makeGraphQLRequest` и `getVersion` класса `CoreService` стали статическими (класс удалён в более поздних версиях).

### Ломающие изменения

- Удалён input-тип `BetweenDate`, используйте `BetweenDateTime`.
- Удалён скаляр `Date`, используйте `DateTime`.

## 2.4.0 (30.08.2023)

### Ломающие изменения

- Из контекста удалено значение `timezone`, удалён `defaultOutputFilter`.
- Удалены функции `stringToCursor`, `cursorToString`, `makeNodeCursor`, `getCursorPayload`, `buildCursorConnection`, `nodeToEdge`, `extractNodeField`, `extractNodeIds`, `arrayOfIdsToArrayOfObjectIds`, `buildQueryFilter`, `extractKeyAsObject`, `fieldBuilder`.
- Удалены константа `DEFAULT_SERVER_TIMEZONE` и тип `ListResponse`.

### Исправления

- Ошибки параметра `between` в функции `buildQueryFilter`.

### Новое

- Скаляр `BigInt` (`BigIntScalarType`).
