# Скаляры и типы

Ядро экспортирует готовые скаляры, input-типы и интерфейсы. Скаляр нужно подключить к схеме: использовать его в поле или аргументе либо перечислить в `types` схемы.

```ts
import { DateTimeScalarType, MoneyScalarType } from '@via-profit-services/core';
```

У каждого скаляра три направления преобразования:
- **вход переменной** (`parseValue`): значение из `variables`;
- **вход литерала** (`parseLiteral`): значение, записанное прямо в тексте запроса;
- **выход** (`serialize`): значение, которое вернул резолвер.

Вход проверяется строго, а выход мягко: на выходе данные приходят из вашего кода и БД, ломать из-за них ответы не нужно.

## Скаляры

### `DateTime`

Дата и время в UTC. Внутри резолверов — объект `Date`.

| | Принимается | Пример |
|---|---|---|
| Вход: строка | Только ISO 8601 в UTC с `Z`, реальная календарная дата | `"2026-03-05T10:15:20Z"`, `"2026-03-05T10:15:20.123Z"` |
| Вход: число | Timestamp в **миллисекундах**, по модулю ≥ 1e11 (1973-03-03 и позже, 1966-10-25 и раньше) | `1772705720000` |
| Выход | `Date`, любая строка, понятная `new Date()`, число мс | → `"2026-03-05T10:15:20.000Z"` |

Отклоняется на входе:
- `"2026-03-05T10:15:20"` и `"2026-03-05"`: без часового пояса непонятно, чьё это локальное время;
- `"2026-03-05T10:15:20+05:00"`: допускается только UTC;
- `"2026-02-30T00:00:00Z"`: такой даты нет (`new Date()` молча превратил бы её в 2 марта);
- `1772705720`: это секунды. Числа меньше 1e11 считаются ошибкой клиента, иначе дата незаметно превратится в январь 1970.

На клиенте используйте `date.toISOString()`.

### `Money`

Денежная сумма в **минимальных единицах** (копейках, центах). Внутри резолверов — `bigint`, в GraphQL — строка.

```
250 ₽  →  "25000"
```

| | Принимается |
|---|---|
| Вход | Только строка из десятичных цифр с необязательным минусом, до 30 цифр: `"25000"`, `"-100"` |
| Выход | `bigint`, строка из цифр, целое число (safe integer) → строка |

Отклоняется: `""`, `" 12 "`, `"0x10"`, `"1.50"`, `"1e3"`, числа (`25000` без кавычек).

Почему `bigint` и строка: дробные числа JavaScript не подходят для денег (`0.1 + 0.2 !== 0.3`), а JSON не умеет передавать `bigint`.

```ts
const Ticket = new GraphQLObjectType({
  name: 'Ticket',
  fields: {
    price: { type: new GraphQLNonNull(MoneyScalarType), resolve: ticket => ticket.priceKopecks },
  },
});
```

### `BigInt`

Целое число произвольного размера, до 100 цифр. Внутри — `bigint`.

| | Принимается |
|---|---|
| Вход | Целое число JSON (safe integer) или строка из цифр |
| Выход | Число, если помещается в `Number.MAX_SAFE_INTEGER`, иначе строка |

### `Time`

Время суток.

| | Принимается |
|---|---|
| Вход | `H:MM`, `HH:MM`, `HH:MM:SS` от `00:00` до `23:59:59`, а также `24:00` / `24:00:00` (конец суток) |
| Выход | Всегда `HH:MM:SS`: `"9:05"` → `"09:05:00"` |

### `EmailAddress`

Строка в формате e-mail. Проверяется регулярным выражением, существование адреса не проверяется.

### `URL`

Абсолютный URL. Внутри резолверов — объект `URL`, на выходе — строка.

Схемы `javascript:` и `vbscript:` отклоняются: такой URL, выведенный ссылкой на фронтенде, приводит к XSS.

### `JSON` и `JSONObject`

- `JSON` — любое JSON-значение без проверки.
- `JSONObject` — только объект (не массив, не примитив).

### `Void`

Всегда `null`. Для мутаций, которым нечего возвращать.

### `FileUpload`

Загруженный файл. Работает только в переменных multipart-запроса. В резолвере значение имеет тип `UploadedFile` (`Promise<FilePayload>`). См. [Загрузка файлов](./file-uploads.md).

## Input-типы «диапазон»

Все поля обязательные.

| Тип | Поля |
|-----|------|
| `BetweenDateTimeInputType` | `start: DateTime!`, `end: DateTime!` |
| `BetweenIntInputType` | `start: Int!`, `end: Int!` |
| `BetweenMoneyInputType` | `start: Money!`, `end: Money!` |
| `BetweenTimeInputType` | `start: Time!`, `end: Time!` |

```graphql
query { orders(createdAt: { start: "2026-01-01T00:00:00Z", end: "2026-02-01T00:00:00Z" }) { id } }
```

## Интерфейсы и типы

| Экспорт | SDL | Назначение |
|---------|-----|------------|
| `NodeInterfaceType` | `interface Node { id: ID! }` | Объект с глобальным идентификатором |
| `EdgeInterfaceType` | `interface Edge { node: Node! cursor: String! }` | Элемент списка с курсором |
| `ConnectionInterfaceType` | `interface Connection { pageInfo: PageInfo! edges: [Edge]! }` | Список с пагинацией |
| `PageInfoType` | `type PageInfo { hasPreviousPage: Boolean! hasNextPage: Boolean! startCursor: String endCursor: String }` | Состояние пагинации |
| `OrderDirectionType` | `enum OrderDirection { ASC DESC }` (значения `'asc'`, `'desc'`) | Направление сортировки |
| `ErrorInterfaceType` | `interface Error { name: String! msg: String! }` | Ошибки как часть данных (union-результаты мутаций) |

Как собрать из них пагинацию — в разделе [Connections](./connections.md).

### Пример: сортировка

```ts
import { GraphQLInputObjectType, GraphQLEnumType, GraphQLNonNull } from 'graphql';
import { OrderDirectionType } from '@via-profit-services/core';

const UsersOrderBy = new GraphQLInputObjectType({
  name: 'UsersOrderBy',
  fields: {
    field: {
      type: new GraphQLNonNull(
        new GraphQLEnumType({
          name: 'UsersOrderField',
          values: { NAME: { value: 'name' }, CREATED_AT: { value: 'createdAt' } },
        }),
      ),
    },
    direction: { type: new GraphQLNonNull(OrderDirectionType) },
  },
});
```
