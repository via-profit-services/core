## Connections and cursor pagination

The core contains a set of types, methods and resolvers that will facilitate the creation and handling of connections as described in the [specification](https://relay.dev/graphql/connections.htm). Contains helpers for implementing cursor pagination and legacy pagination by offset/limit.

## Table of contents

 - [Cursor based pagination](#cursor-based-pagination)
 - [limit/offset pagination](#limit-offset-pagination)


## Cursor based pagination

**Note: you can use our approach or come up with your own. Everything described below is only a recommendation. You have the right to act at your discretion.**

Suppose we need to create an api that can return a list of users. We also need to be able to request a certain number of records, that is, split into pages. We will also need to implement the ability to sort, search and apply filters. The GraphQL specification clearly describes what **first** ,**after**, **last** and **before** are for, but among the documents it is not easy to find information on how to apply various filters to pagination with cursors at the same time.

If you want to use pagination by cursors, then the sequence of actions should be as follows: First you apply some sort of selection filter, sorting, and anything else. You can specify how many elements you want to get, but you can't pass cursors (**after** or **before**) in the first request. When you get the first selection result, you will get access to the cursors. To move back and forth through the pages, you have to pass only two parameters: the cursor (**after** or **before**) and the number of results (**first** or **last**). The thing is that cursor-based pagination assumes that when you move through pages, you cannot change their order and total number. That is why all filters and sorting are applied once at the first request.

How it works: At the first request, you call the [buildQueryFilter](./api.md#buildqueryfilter) function, which accepts a set of parameters containing filters, sorting, and so on. This function returns the passed parameters after preprocessing them (for more information, see the [buildCursorConnection](./api.md#buildcursorconnection)). Next, the result is passed to your custom function or class, which should return the number of results satisfying the request (**totalCount**) and an array of received nodes (**nodes**). Now you have everything you need to call the **buildCursorConnection** function, which forms the cursor and the connection. Under the hood, the **buildCursorConnection** function generates the resulting filters and sorts into a string that is encoded in Base64. So **buildQueryFilter** and **buildCursorConnection** work for each other. At the next graphql request, the **buildQueryFilter** function, to which the cursor will be passed, will parse the data lying in the cursor and return an object with filters and sorting, as well as with a limit and offset, which can be used in an SQL query.

<!-- ![Connection request architecture](https://github.com/via-profit-services/website/raw/standalone/1.0/assets/images/request-connection.png) -->

According to the graphQL paradigm, first we have to declare the scheme:

_schema.graphql:_

```graphql
extend type Query {
  list(
    first: Int
    last: Int
    after: String
    before: String
    offset: Int
    orderBy: [UserOrderBy!]
    between: UsersListBetween
    search: [UserFilterSearch!]
    filter: UserListFilter
  ): UserListConnection!
}

"""
Example of User type
"""
type User implements Node {
  id: ID!
  name: String!
  status: UserStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""
Example of user status
"""
enum UserStatus {
  active
  inactive
}

"""
Ordering options
"""
input UserOrderBy {
  field: UserOrderField!
  direction: OrderDirection!
}

"""
Ordering fields of UserOrderBy input
"""
enum UserOrderField {
  name
  createdAt
  updatedAt
}

"""
Between filter
"""
input UsersListBetween {
  updatedAt: BetweenDateTime
  createdAt: BetweenDateTime
}

"""
User search filter
"""
input UserFilterSearch {
  field: UserFilterSearchField!
  query: String!
}

"""
Possible fields to search users
"""
enum UserFilterSearchField {
  name
  status
}

"""
Possible data to filter list of users
"""
input UserListFilter {
  id: [ID!]
  status: [UserStatus!]
}

"""
Users list bundle
"""
type UserListConnection implements Connection {
  totalCount: Int!
  pageInfo: PageInfo!
  edges: [UsersEdge!]!
}

"""
User edge bundle
"""
type UsersEdge implements Edge {
  node: User!
  cursor: String!
}
```

GraphQL types **OrderDirection**, **Connection**, **PageInfo**, **Edge**, **Node** and etc. already declared in Core typedefs (see: [TypeDefs](./typedefs.md)).

As you can see, the field `list` of type `Query` has the following set of arguments:

 - **first** - pagination argument as per GraphQl specification
 - **last** - pagination argument as per GraphQl specification
 - **after** - pagination argument as per GraphQl specification
 - **before** - pagination argument as per GraphQl specification
 - **offset** - pagination argument. Offset value to be passed to PostgreSQL query (`select * from users offset 3 limit 100`)
 - **orderBy** - an argument that is analogous to the ORDER BY statement in SQL
 - **between** - an argument that is analogous to the BETWEEN statement in SQL
 - **search** - the argument contains the search terms
 - **filter** - an argument that is analogous to the WHERE statement in SQL

We use exactly this structure of arguments. The core module contains several useful methods for processing incoming parameters.

Now you can create a resolvers for this schema:

_resolvers:_

```js
const {
  buildQueryFilter,
  buildCursorConnection
} = require("@via-profit-services/core");

const resolvers = {
  Query: {
    list: async (_parent, args, context) => {
      // The Users class was added to the context by middleware in (index.js)
      const { Users } = context.services;
      // convert input arguments to persist filter (See return value of this method)
      // Will be return `OutputFilter` type with normalized props
      // You can use this filter in your Model class
      const { limit, offset, where, revert, orderBy } = buildQueryFilter(args);
      // Your model should return the data for the connection
      // You must provide totalCount and nodes yourself
      // limit, offset, and others can be returned
      // in the same form as received from the buildQueryFilter method
      // to simplify the selection from the database using filters, you
      // can use the package https://github.com/via-profit-services/knex
      const { totalCount, nodes } = Users.getUsers({
        where,
        limit,
        offset,
        orderBy
      });

      // Now you can build the conection object like this:
      // method buildCursorConnection combine and return edges,
      // pageInfo and totalCount values
      const connection = buildCursorConnection({
        totalCount,
        nodes,
        limit,
        offset,
        where,
        revert,
        orderBy
      });

      // connection const will be like this: {
      //   totalCount: 20,
      //   edges: [{ id: '1', name: 'Leo' }, {id: '2', name: 'Raph'}],
      //   pageInfo: {
      //     startCursor: '=JHKJ',
      //     endCursor: '==JHKdJ',
      //     hasPreviousPage: false,
      //     hasNextPage: true,
      //   },
      // }
      return connection;
    }
  }
};

module.exports = resolvers;

```

Now you can use paginated navigation on cursors, but that's not all. You can use navigation using **limit** and **offset** parameters without changing the code.

[![Edit @via-profit-services-core-node-connections](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/via-profit-services-core-node-connections-u3y9b?fontsize=14&hidenavigation=1&theme=dark)

## limit/offset pagination

GraphQL specification prescribes the use of paginated navigation on cursors, but this is not a requirement, but only a recommendation. If you want, you can use pagination on **limit** and **offset**. Using [buildCursorConnection](./api.md#buildcursorconnection) you do not have to change the code, besides using the selection via **limit** and **offset**, there is no need for you to follow the sequence of query execution as when using [cursors](#cursor-based-pagination).

The advantages of this approach over pagination on cursors is that you can simultaneously switch pages (**offset**) and change the selection and sorting conditions (**filter** and **orderBy**).

To implement the above, refer to the documentation of pagination on [cursors](#cursor-based-pagination).


_Variables when paginating to limit and offset:_

```json
{
  "first": 3,
  "offset": 4,
  "filter": {
    "status": ["active"]
  }
}
```

[![Edit @via-profit-services-core-node-limit-offset](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/via-profit-services-core-node-limit-offset-7s48i?fontsize=14&hidenavigation=1&theme=dark)


## Typescript

For the resolver described above, you can use the following types:

```ts
import type { GraphQLFieldResolver } from 'graphql';
import type { Context, InputFilter } from '@via-profit-services/core';

type Resolvers = {
  Query: {
    list: GraphQLFieldResolver<unknown, Context, InputFilter>;
  };
};

const resolvers: Resolvers = {
  Query: {
    list: async (_parent, args, context) => {
      const { filter } = args;

      ...
    },
  },
};

export default resolvers;
```
