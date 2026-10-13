# Persisted Queries

Persisted query — запрос, текст которого заранее известен серверу. Клиент отправляет только его идентификатор.

Зачем это нужно:
- **меньше трафика**: идентификатор вместо килобайт текста запроса;
- **безопасность**: с `persistedQueriesOnly: true` сервер выполняет только известные запросы, и произвольный запрос злоумышленника не пройдёт;
- **скорость**: набор запросов ограничен, поэтому все они попадают в [кэш документов](./security.md#кэш-документов) и разбираются только при первом использовании.

## Настройка

```ts
const persistedQueriesMap = {
  'user-profile-v1': 'query UserProfile($id: ID!) { user(id: $id) { id name } }',
  'f3a1c9…': 'mutation UpdateName($name: String!) { updateName(name: $name) }',
};

const graphqlHTTP = graphqlHTTPFactory({
  schema,
  persistedQueriesMap,
  persistedQueryKey: 'documentId', // имя параметра с идентификатором, по умолчанию 'documentId'
  persistedQueriesOnly: true,      // запретить запросы не из карты
});
```

Карту обычно генерирует сборка фронтенда: [Relay Compiler](https://relay.dev/docs/guides/persisted-queries/), GraphQL Code Generator (`client-preset` с `persistedDocuments`). В качестве идентификатора удобно использовать хэш текста запроса.

## Запросы клиента

Идентификатор передаётся в теле, в URL или в поле `operations` multipart-запроса:

```http
POST /graphql
Content-Type: application/json

{ "documentId": "user-profile-v1", "variables": { "id": "42" } }
```

```http
GET /graphql?documentId=user-profile-v1&variables=%7B%22id%22%3A%2242%22%7D
```

## Поведение

| Ситуация | `persistedQueriesOnly: false` | `persistedQueriesOnly: true` |
|----------|-------------------------------|------------------------------|
| Идентификатор есть в карте | Выполняется запрос из карты, поле `query` игнорируется | То же |
| Идентификатора нет в карте, есть `query` | Выполняется `query` | Ошибка `Only persisted queries are allowed` |
| Только `query` | Выполняется `query` | Ошибка |

Идентификатор ищется только среди собственных ключей карты: значения вроде `constructor` или `__proto__` не совпадут со свойствами прототипа.
