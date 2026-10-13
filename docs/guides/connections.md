# Пагинация (Connections)

Ядро содержит типы для курсорной пагинации по [спецификации Relay Connections](https://relay.dev/graphql/connections.htm): `NodeInterfaceType`, `EdgeInterfaceType`, `ConnectionInterfaceType`, `PageInfoType`. Ниже показан один из возможных подходов: это рекомендация, а не единственно верный способ.

## Идея

Курсорная пагинация устроена так:

1. Первый запрос передаёт **критерии** (фильтры, сортировку) и количество записей (`first` или `last`), но без курсора.
2. Каждая запись ответа получает **курсор** — строку, по которой можно продолжить выборку.
3. Следующие запросы передают только курсор (`after` или `before`) и количество. Критерии восстанавливаются из курсора.

Фильтры и сортировка фиксируются в первом запросе, поэтому порядок страниц не меняется при листании.

![GraphQL connections](../../assets/connections.png)

## Схема

```graphql
type Query {
  users(first: Int, last: Int, after: String, before: String, status: [UserStatus!]): UsersConnection!
}

type User implements Node {
  id: ID!
  name: String!
  status: UserStatus!
}

enum UserStatus { ALLOWED FORBIDDEN }

type UsersConnection implements Connection {
  pageInfo: PageInfo!
  edges: [UserEdge!]!
}

type UserEdge implements Edge {
  node: User!
  cursor: String!
}
```

### Типы на TypeScript

```ts
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLEnumType,
  GraphQLList,
} from 'graphql';
import {
  NodeInterfaceType,
  EdgeInterfaceType,
  ConnectionInterfaceType,
  PageInfoType,
} from '@via-profit-services/core';

const UserStatus = new GraphQLEnumType({
  name: 'UserStatus',
  values: {
    ALLOWED: { value: 'allowed' },
    FORBIDDEN: { value: 'forbidden' },
  },
});

const User = new GraphQLObjectType({
  name: 'User',
  interfaces: [NodeInterfaceType],
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    status: { type: new GraphQLNonNull(UserStatus) },
  },
});

const UserEdge = new GraphQLObjectType({
  name: 'UserEdge',
  interfaces: [EdgeInterfaceType],
  fields: () => ({
    cursor: { type: new GraphQLNonNull(GraphQLString) },
    node: { type: new GraphQLNonNull(User) },
  }),
});

const UsersConnection = new GraphQLObjectType({
  name: 'UsersConnection',
  interfaces: [ConnectionInterfaceType],
  fields: () => ({
    pageInfo: { type: new GraphQLNonNull(PageInfoType) },
    edges: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserEdge))) },
  }),
});
```

## Курсор

Курсор хранит критерии выборки и позицию. Ниже — минимальная реализация на base64-JSON.

> ⚠️ **Курсор приходит от клиента, и его можно подделать.** Base64 — это не защита:
> клиент декодирует курсор, поменяет `status` или `offset` и закодирует обратно.
> Поэтому курсор **проверяется** как любые входные данные, а ограничения доступа
> (например, «только записи моей организации») **никогда не берутся из курсора**:
> их нужно применять заново из `context` в каждом запросе. Если подмена курсора
> недопустима, подписывайте его HMAC-ом.

```ts
import { GraphQLError } from 'graphql';

type UsersCursor = {
  offset: number;
  status: Array<'allowed' | 'forbidden'> | null;
};

const encodeCursor = (cursor: UsersCursor) =>
  Buffer.from(JSON.stringify(cursor)).toString('base64url');

const decodeCursor = (value: string): UsersCursor => {
  try {
    const cursor = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    const statusOk =
      cursor.status === null ||
      (Array.isArray(cursor.status) &&
        cursor.status.every((s: unknown) => s === 'allowed' || s === 'forbidden'));

    if (Number.isSafeInteger(cursor.offset) && cursor.offset >= 0 && statusOk) {
      return { offset: cursor.offset, status: cursor.status };
    }
  } catch {
    // fall through
  }

  throw new GraphQLError('Invalid cursor', { extensions: { code: 'BAD_USER_INPUT' } });
};
```

## Резолвер

```ts
const MAX_PAGE_SIZE = 100;

const usersField = {
  type: new GraphQLNonNull(UsersConnection),
  args: {
    first: { type: GraphQLInt },
    last: { type: GraphQLInt },
    after: { type: GraphQLString },
    before: { type: GraphQLString },
    status: { type: new GraphQLList(new GraphQLNonNull(UserStatus)) },
  },
  resolve: async (_parent, args, context) => {
    const { first, last, after, before } = args;

    // 1. Проверка аргументов
    if ((first == null) === (last == null)) {
      throw new GraphQLError('Provide exactly one of «first» or «last»');
    }
    const size = (first ?? last) as number;
    if (size < 0 || size > MAX_PAGE_SIZE) {
      throw new GraphQLError(`«first»/«last» must be between 0 and ${MAX_PAGE_SIZE}`);
    }
    if (last != null && !before) {
      throw new GraphQLError('«last» requires the «before» cursor');
    }

    // 2. Критерии: из аргументов (первый запрос) или из курсора (следующие)
    let criteria: UsersCursor = { offset: 0, status: args.status ?? null };
    let offset = 0;

    if (after) {
      criteria = decodeCursor(after);
      offset = criteria.offset + 1;
    }

    if (before) {
      criteria = decodeCursor(before);
      offset = Math.max(criteria.offset - size, 0);
    }

    // 3. Выборка. lag/lead показывают, есть ли записи до и после страницы:
    //    оконные функции считаются ДО limit/offset, по всей отфильтрованной выборке
    const query = context.knex
      .select(
        'users.*',
        context.knex.raw('lag(??) over (order by ??) as "prev"', ['users.id', 'users.id']),
        context.knex.raw('lead(??) over (order by ??) as "next"', ['users.id', 'users.id']),
      )
      .from('users')
      .where('users.organizationId', context.user.organizationId) // доступ — из контекста, не из курсора
      .orderBy('users.id')
      .limit(size)
      .offset(offset);

    if (criteria.status) {
      query.whereIn('users.status', criteria.status);
    }

    const rows = await query;

    // 4. Ответ
    const edges = rows.map((node, index) => ({
      node,
      cursor: encodeCursor({ ...criteria, offset: offset + index }),
    }));

    return {
      edges,
      pageInfo: {
        hasPreviousPage: rows.length > 0 && rows[0].prev !== null,
        hasNextPage: rows.length > 0 && rows[rows.length - 1].next !== null,
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
      },
    };
  },
};
```

## Пагинация и лимит сложности

`first`, `limit`, `take`, `pageSize` и `size` по умолчанию считаются [множителями сложности](./configuration.md#complexitylimit): `users(first: 100) { posts(first: 50) { id } }` стоит около 10 000. Ограничивайте максимальный размер страницы в резолвере (как `MAX_PAGE_SIZE` выше) и подбирайте `maxComplexity` под реальные запросы клиентов.

## Limit/offset

Спецификация GraphQL рекомендует курсорную пагинацию, но не требует её. Внутри резолвера курсоры всё равно превращаются в `limit` и `offset`, как в примере выше. Если клиенту курсоры не нужны (админки, отчёты), аргументы `limit`/`offset` допустимы. Клиент [Relay](https://relay.dev) работает только с курсорами.
