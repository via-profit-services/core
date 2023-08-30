# GraphQL types and scalars of @via-profit-services/core

## Table of contents

- [Scalars](#scalars)
  - [Money](#money)
  - [DateTime](#datetime)
  - [Date](#date)
  - [Time](#time)
  - [URL](#url)
  - [EmailAddress](#emailaddress)
  - [JSON](#json)
  - [JSONObject](#jsonobject)
  - [FileUpload](#fileupload)
  - [Void](#void)
- [Types](#types)
  - [Node](#node)
  - [Edge](#edge)
  - [Connection](#connection)
  - [PageInfo](#pageinfo)
  - [OrderDirection](#orderdirection)
  - [Error](#error)
  - BigInt
  - BetweenDate
  - BetweenTime
  - BetweenDateTime
  - BetweenInt
  - BetweenMoney
- [Full source listing of types](#full-source-listing-of-types)

## Scalars

### Money

**Money** - The value is stored in the smallest monetary unit (kopecks, cents, etc.). Real type - Int. E.g. For 250 USD this record returns value as 250000 (250$ \* 100¢)

It is assumed that you will store the value of this type in its smallest value All calculations in the same way.

Usage example:

```ts
import { GraphQLObjectType, GraphQLNonNull, GraphQLID } from 'graphql';
import { Context, MoneyScalarType } from '@via-profit-services/core';

const Ticket = new GraphQLObjectType<unknown, Context>({
  name: 'Ticket',
  fields: {
    price: {
      type: new GraphQLNonNull(MoneyScalarType),
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },
});

export default Ticket;
```

### DateTime

**DateTime** - Use JavaScript Date object for date/time fields.

### Date

**Date** - Use JavaScript Date object for date fields.

### Time

**Time** - And Time type.

### URL

**URL** - A field which value conforms to the standard URL format as specified in [RFC3986](https://www.ietf.org/rfc/rfc3986.txt).

### EmailAddress

**EmailAddress** - A field which value conforms to the standard internet email address format as specified in [RFC822](https://www.w3.org/Protocols/rfc822/).

### JSON

**JSON** - The JSON scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).

### JSONObject

**JSONObject** - The JSONObject scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).

### Void

**Void** - Represents NULL values

### FileUpload

**FileUpload** - The scalar as specified GraphQL multipart request [specification](https://github.com/jaydenseric/graphql-multipart-request-spec#graphql-multipart-request-specification)

_Examples of usage:_

```graphql
type Query {
  user(id: ID!): User
}

type Mutation {
  update (id: ID!): Void
}

type User {
  id: ID!
  avatar: URL! """ <-- https://example.com/foo/bar"""
  createdAt: DateTime! """ <-- 2021-10-07T12:31:08+05:00"""
  email: EmailAddress! """ <-- user@example.com"""
  meta: JSON! """ <-- [{ foo: "bar" }]"""
}
```

## Types

### Node

The `Node` **interface** is used to declare a type that must have an `ID`. Node is also used in connections [connections](./connections.md)

According to the specification, the Node must contain at least an `id` field with the `ID!` type

Interface implements the SDL:

```graphql
interface Node {
  id: String!
}
```

Usage example:

```ts
import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { Context, DateTimeScalarType, NodeInterfaceType } from '@via-profit-services/core';

const MyNode = new GraphQLObjectType<unknown, Context>({
  name: 'MyNode',
  interfaces: () => [NodeInterfaceType],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export default MyNode;
```

### Edge

The `Edge` **interface** is used to declare [connections](./connections.md). Each edge must contain a key `node` and `cursor`. (see [Connection spec.](https://relay.dev/graphql/connections.htm) for more details).
According to the specification, the Edge must contain at least an `cursor` field with the type of `String!` and the `node` field with type of your Node.

Interface implements the SDL:

```graphql
interface Edge {
  node: SomeNode!
  cursor: String!
}
```

Usage example:

```ts
import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { EdgeInterfaceType } from '@via-profit-services/core';

import MyNode from './MyNode';

const MyEdge = new GraphQLObjectType({
  name: 'MyEdge',
  interfaces: [EdgeInterfaceType],
  fields: () => ({
    cursor: { type: new GraphQLNonNull(GraphQLString) },
    node: { type: new GraphQLNonNull(MyNode) },
  }),
});

export default MyEdge;
```

### Connection

The `Connection` **interface** is used to declare connections. more info - [connections](./connections.md). Each connection must contain a key `totalCount`, `pageInfo` and `edges` (see [Connection spec.](https://relay.dev/graphql/connections.htm) for more details).

Interface implements the SDL:

```graphql
interface Connection {
  pageInfo: PageInfo!
  edges: [Edge!]!
}
```

Usage example:

```ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { PageInfoType, ConnectionInterfaceType } from '@via-profit-services/core';

import MyEdge from './MyEdge';

const MyConnection = new GraphQLObjectType({
  name: 'MyConnection',
  interfaces: [ConnectionInterfaceType],
  fields: () => ({
    pageInfo: { type: new GraphQLNonNull(PageInfoType) },
    edges: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MyEdge))),
    },
  }),
});

export default MyConnection;
```

### PageInfo

The `PageInfo` **type** is used to declare [connections](#connections). (see [Connection spec.](https://relay.dev/graphql/connections.htm) for more details)
Interface implements the SDL:

```graphql
type PageInfo {
  hasPreviousPage: Boolean!
  hasNextPage: Boolean!
  startCursor: String
  endCursor: String
}
```

Usage example:

```ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { PageInfoType, ConnectionInterfaceType } from '@via-profit-services/core';

import MyEdge from './MyEdge';

const MyConnection = new GraphQLObjectType({
  name: 'MyConnection',
  interfaces: [ConnectionInterfaceType],
  fields: () => ({
    pageInfo: { type: new GraphQLNonNull(PageInfoType) },
    edges: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MyEdge))) },
  }),
});

export default MyConnection;
```

### OrderDirection

The `OrderDirection` **type** is an Enum type to make the order (ASC, DESC)
Interface implements the SDL:

```graphql
enum OrderDirection {
  """
  Sort the query results in a top to bottom style (e.g.: A->Z)
  """
  ASC

  """
  Sort the query results in a bottom to top style (e.g.: Z->A)
  """
  DESC
}
```

Usage example:

```ts
import { GraphQLInputObjectType, GraphQLEnumType, GraphQLNonNull } from 'graphql';
import { OrderDirectionType } from '@via-profit-services/core';

const MyOrderBy = new GraphQLInputObjectType({
  name: 'MyOrderBy',
  fields: () => ({
    direction: { type: new GraphQLNonNull(OrderDirectionType) },
    field: {
      type: new GraphQLNonNull(
        new GraphQLEnumType({
          name: 'BlockOrderField',
          values: {
            NAME: { value: 'name' },
            TYPE: { value: 'type' },
          },
        }),
      ),
    },
  }),
});

export default MyOrderBy;
```

### Error

GraphQL Error interface

Interface implements the SDL:

```graphql
interface Error {
  name: String!
  msg: String!
}
```

Usage example:

```ts
import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { ErrorInterfaceType } from '@via-profit-services/core';

const MyError = new GraphQLObjectType({
  name: 'MyError',
  interfaces: () => [ErrorInterfaceType],
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    msg: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export default MyError;
```
