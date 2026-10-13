# Extensions

`extensions` — поле ответа GraphQL для любых данных, которые не относятся к `data` и `errors` ([спецификация](https://spec.graphql.org/October2021/#sec-Response-Format)). Ядро возвращает его в каждом ответе, включая ответы с ошибкой.

```json
{
  "data": { "orders": { "...": "..." } },
  "extensions": {
    "requestId": "6c1f0b7e-2a7d-4f0e-9a51-1d6a3c0e8b42",
    "deprecation": "Use «ordersV2»"
  }
}
```

## Что и когда попадает в ответ

| Поле | Когда | Что это |
|------|-------|---------|
| Поля проекта | Всегда | Всё, что добавили резолверы (`setExtension`) и middleware |
| `requestId` | Всегда | ID запроса, см. [ниже](#requestid) |
| `limits` | `limits.exposeUsage` или `debug` | Сколько каждого лимита израсходовал запрос, см. [Подбор лимитов](#подбор-лимитов) |
| `queryTime`, `requestCounter`, `startupTime` | Только `debug` | Время запроса (мс), номер запроса с момента старта, время старта |
| `diagnostics` | Только `debug` | Имя операции, persisted query, попадание в кэш документов, время по этапам |

Почему так. Поля проекта и `requestId` проект отдаёт осознанно, поэтому они отправляются всегда. Счётчик запросов, время старта и время этапов раскрывают устройство и нагрузку сервера, поэтому они видны только в режиме `debug`.

> ⚠️ Маршрут проекта должен передавать `extensions` дальше как есть:
>
> ```ts
> const { data, errors, extensions } = await graphqlHttp(req, res);
> res.end(JSON.stringify({ data, errors, extensions }));
> ```
>
> Код вида `extensions: debug ? extensions : undefined` из старых версий отрезает поля проекта и `requestId` в проде. Ядро само не отдаёт диагностику без `debug`, так что проверка в маршруте не нужна.

## Свои поля

### Из резолвера: `setExtension`

```ts
import { setExtension } from '@via-profit-services/core';

const ordersField = {
  type: OrdersConnection,
  resolve: async (_parent, args, context) => {
    setExtension(context, 'deprecation', 'Use «ordersV2»');

    return loadOrders(args);
  },
};
```

Запрос находится по объекту `context`: у каждого запроса он свой. Ядро не добавляет в `context` своих ключей.

- Повторный вызов с тем же именем заменяет значение.
- Значение должно сериализоваться в JSON: ответ отправляется как JSON.
- Имена `requestId`, `limits`, `queryTime`, `requestCounter`, `startupTime`, `diagnostics` зарезервированы ядром (константа `RESERVED_EXTENSIONS`): `setExtension` бросит ошибку.
- С устаревшим `sharedContext: true` не работает: общий контекст принадлежит всем запросам сразу.

### Из middleware

Middleware получает объект `extensions` текущего запроса и пишет в него напрямую:

```ts
const versionMiddleware: Middleware = ({ request, extensions }) => {
  if (request.headers['x-app-version'] === '1.0.0') {
    extensions.upgrade = 'A new version of the app is available';
  }
};
```

Не используйте зарезервированные имена: когда ядро отдаёт своё поле, оно перекрывает значение middleware.

## `requestId`

Каждый ответ получает `extensions.requestId`. Резолверы и middleware получают то же значение через `getRequestId(context)`. Пишите его в логи, и по ответу, который прислал пользователь, найдётся запись в логе сервера:

```ts
import { getRequestId } from '@via-profit-services/core';

logger.error('Payment failed', { requestId: getRequestId(context), orderId });
```

Если перед сервером стоит прокси, который ставит заголовок `X-Request-Id` (nginx `$request_id`, балансировщики облаков), ядро берёт ID из него, и логи всей цепочки связываются. Заголовок приходит снаружи и попадает в логи, поэтому принимается только строка до 128 символов из `A-Z a-z 0-9 . _ : -`. Иначе генерируется случайный UUID: перевод строки в заголовке не сможет подделать запись в логе.

## Подбор лимитов

Лимиты глубины, сложности и размеров нельзя подобрать «на глаз»: сложность реального запроса CRM легко оказывается в десятки тысяч. Ядро измеряет каждый запрос и отдаёт значения вместе с лимитами:

```json
"limits": {
  "operationName": "OrdersList",
  "bodySize":   { "value": 1830,  "max": 1048576 },
  "tokens":     { "value": 412,   "max": 10000 },
  "depth":      { "value": 6,     "max": 20 },
  "complexity": { "value": 13245, "max": 50000 },
  "width":      { "value": 21,    "max": 50 }
}
```

| Поле | Что измерено | Лимит |
|------|--------------|-------|
| `bodySize` | Размер JSON-тела на входе (сжатого, если сжато), байт | `maxJSONBodySize` |
| `files`, `filesTotalSize` | Количество и общий размер загруженных файлов | `maxFiles`, `maxFilesTotalSize` |
| `tokens` | Токены документа (так же, как их считает парсер) | `maxGraphQLTokens` |
| `depth` | Глубина, наибольшая среди операций документа | `maxGraphQLDepthLimit` |
| `complexity` | Сложность с учётом переменных, наибольшая среди операций | `complexityLimit.maxComplexity` |
| `width` | Наибольшее число полей в одном блоке `{ }` | `complexityLimit.maxFieldsPerSelection` |

`max: null` значит, что лимит выключен. Значение всё равно измеряется: оно и нужно, чтобы выбрать лимит. Запрос, отклонённый лимитом, тоже получает `limits`: видно, насколько он превысил лимит.

### В разработке: `extensions.limits`

При `debug: true` поле `limits` есть в каждом ответе. Его видно прямо в GraphiQL или во вкладке Network браузера. Чтобы отдавать его без `debug` (например, клиенту, который сам снижает нагрузку), включите `limits.exposeUsage: true`. Значения раскрывают настроенные лимиты. Их и так можно найти перебором, но без необходимости не включайте.

### В проде: `limits.onUsage`

Запросы разработчика не похожи на реальную нагрузку: лимиты нужно подбирать по рабочему трафику. `onUsage` вызывается для каждого запроса, у которого удалось разобрать документ, и ничего не отдаёт клиенту:

```ts
graphqlHTTPFactory({
  schema,
  limits: {
    onUsage: (usage, context) => {
      complexityHistogram.observe({ operation: usage.operationName ?? 'anonymous' }, usage.complexity?.value ?? 0);
      depthHistogram.observe(usage.depth?.value ?? 0);
    },
  },
});
```

Без системы метрик подойдёт и лог: через неделю посмотрите максимум и 99-й перцентиль по каждой величине и поставьте лимит с запасом над максимумом. Исключение внутри `onUsage` передаётся в `onError` и на запрос не влияет.

Замеры стоят немного: один дополнительный проход лексера при первом появлении документа (дальше значение берётся из кэша) и обратные вызовы в правилах. Без `debug`, `exposeUsage` и `onUsage` ядро ничего не измеряет.

## Режим `debug`: диагностика

```json
"extensions": {
  "requestId": "…",
  "limits": { "…": "…" },
  "queryTime": 4.82,
  "requestCounter": 1532,
  "startupTime": "2026-10-13T07:00:00.000Z",
  "diagnostics": {
    "operationName": "OrdersList",
    "persisted": false,
    "documentCache": "hit",
    "timing": { "middlewares": 0.41, "body": 0.12, "document": 0.02, "validation": 0.35, "execution": 3.71 }
  }
}
```

- `requestCounter` — номер **этого** запроса с момента старта сервера.
- `documentCache` — `hit`, если разобранный и проверенный документ взят из кэша. Если повторный одинаковый запрос всё время даёт `miss`, обработчик скорее всего создаётся заново на каждый запрос: создавайте `graphqlHTTPFactory(...)` один раз при старте.
- `timing` — миллисекунды по этапам: middleware, чтение тела, разбор и стандартная валидация документа, правила глубины и сложности, выполнение. Этап, до которого запрос не дошёл, отсутствует.
