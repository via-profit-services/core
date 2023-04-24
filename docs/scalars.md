## GraphQL types and scalars

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
    - Error
    - BigInt
    - BetweenDate
    - BetweenTime
    - BetweenDateTime
    - BetweenInt
    - BetweenMoney
 - [Full source listing of types](#full-source-listing-of-types)


## Scalars

### Money

**Money** - The value is stored in the smallest monetary unit (kopecks, cents, etc.). Real type - Int. E.g. For 250 USD this record returns value as 250000 (250$ * 100¢)
 
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

Example of usage:

```graphql
type User implements Node {
  id: ID!
  name: String!
}
```

### Edge

The `Edge` **interface** is used to declare [connections](./connections.md). Each edge must contain a key `node` and `cursor`. (see [Connection spec.](https://relay.dev/graphql/connections.htm) for more details).

Example of usage:

```graphql
type UserEdge implements Edge {
  node: User!
  cursor: String!
}

type User implements Node {
  id: ID!
  name: String!
}
```

### Connection

The `Connection` **interface** is used to declare connections. more info - [connections](./connections.md). Each connection must contain a key `totalCount`, `pageInfo` and `edges` (see [Connection spec.](https://relay.dev/graphql/connections.htm) for more details).

Example of usage:

```graphql
type UsersConnection implements Connection {
  totalCount: Int!
  pageInfo: PageInfo!
  edges: [UserEdge!]!
}

type UserEdge implements Edge {
  node: User!
  cursor: String!
}

type User implements Node {
  id: ID!
  name: String!
}
```

### PageInfo

The `PageInfo` **type** is used to declare [connections](#connections). (see [Connection spec.](https://relay.dev/graphql/connections.htm) for more details)

**Note: the `PageInfo` type already exists in the schema and you should not define it yourself if you include in Core typeDefs.**

_How to connect Core typeDefs using [@graphql-tools](https://github.com/ardatan/graphql-tools):_
```js
import { GraphQLSchema } from 'graphql';
import { PageInfoType } from "@via-profit-services/core";
import { makeExecutableSchema } from "@graphql-tools/schema";

const Schema = new GraphQLSchema({
  type: [PageInfoType],
  ...
});
```

### OrderDirection

The `OrderDirection` **type** is an Enum type to make the order (ASC, DESC)

Example of usage:

_Your schema could be like this:_

```graphql
type Query {
  users(
    first: Int
    after: String
    orderBy: [UsersOrderBy!]
  ): [User!]!
}

input UsersOrderBy {
  field: UserOrderField!
  direction: OrderDirection!
}

enum UserOrderField {
  name
  age
}
```