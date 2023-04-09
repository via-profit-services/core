## GraphQL types and scalars

## Table of contents
 - [Scalars](#scalars)
 - [Types](#types)
    - [Node](#node)
    - [Edge](#edge)
    - [Connection](#connection)
    - [PageInfo](#pageinfo)
    - [OrderDirection](#orderdirection)
    - Error
    - BetweenDate
    - BetweenTime
    - BetweenDateTime
    - BetweenInt
    - BetweenMoney
 - [Full source listing of types](#full-source-listing-of-types)


## Scalars

 - **Money** - The value is stored in the smallest monetary unit (kopecks, cents, etc.). Real type - Int. E.g. For 250 USD this record returns value as 250000 (250$ * 100¢)
 - **DateTime** - Use JavaScript Date object for date/time fields.
 - **Date** - Use JavaScript Date object for date fields.
 - **Time** - And Time type.
 - **URL** - A field which value conforms to the standard URL format as specified in [RFC3986](https://www.ietf.org/rfc/rfc3986.txt).
 - **EmailAddress** - A field which value conforms to the standard internet email address format as specified in [RFC822](https://www.w3.org/Protocols/rfc822/).
 - **JSON** - The JSON scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
 - **JSONObject** - The JSONObject scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
 - **Void** - Represents NULL values

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
import * as core from "@via-profit-services/core";
import { makeExecutableSchema } from "@graphql-tools/schema";

const schema = makeExecutableSchema({
  typeDefs: [
    core.typeDefs,
  ],
  resolvers: [
    core.resolvers,
  ]
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


### Full source listing of types

The Core module exports the typeDefs schema as follows:

```graphql
type Query {
  core: String!
}

type Mutation {
  core(str: String!): String!
}


"""
Standart ordering options
"""
enum OrderDirection {
  ASC
  DESC
}

"""
Error handle interface
"""
interface Error {
  """
  Error name. Can be short error message
  """
  name: String!

  """
  Error detail message string
  """
  msg: String
}

"""
Information about pagination in a connection.
"""
type PageInfo {
  hasPreviousPage: Boolean!
  hasNextPage: Boolean!
  startCursor: String
  endCursor: String
}

"""
GraphQL Node spec. interface
"""
interface Node {
  id: ID!
}

"""
GraphQL Edge spec. interface
"""
interface Edge {
  node: Node!
  cursor: String!
}

"""
GraphQL Connection spec. interface
"""
interface Connection {
  totalCount: Int!
  pageInfo: PageInfo!
  edges: [Edge]!
}

input BetweenDate {
  start: Date!
  end: Date!
}

input BetweenTime {
  start: Time!
  end: Time!
}

input BetweenDateTime {
  start: DateTime!
  end: DateTime!
}

input BetweenInt {
  start: Int!
  end: Int!
}

input BetweenMoney {
  start: Money!
  end: Money!
}

"""
Money type.
The value is stored in the smallest monetary unit (kopecks, cents, etc.)
Real type - Int
e.g. For 250 USD this record returns value as 250000 (250$ * 100¢)
"""
scalar Money

"""
DateTime type.
Use JavaScript Date object for date/time fields

"""
scalar DateTime
"""
Date type.
Use JavaScript Date object for date fields
"""
scalar Date

"""
Time type.
"""
scalar Time

"""
URL type.
A field whose value conforms to the standard URL format
as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt.
"""
scalar URL

"""
Email address type.
A field whose value conforms to the standard internet
email address format as specified in RFC822: https://www.w3.org/Protocols/rfc822/.
"""
scalar EmailAddress

"""
The JSON scalar type represents JSON values as specified
by ECMA-404: http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf.
"""
scalar JSON
"""
The JSONObject scalar type represents JSON objects as specified by
ECMA-404: http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf.
"""
scalar JSONObject

"""
Represents NULL values
"""
scalar Void
```