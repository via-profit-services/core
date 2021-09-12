# Via Profit Services / Core

![via-profit-services-cover](./assets/via-profit-services-cover.png)

> Via Profit services / **Core** - [GraphQL](https://graphql.org/) server based on [Express](http://expressjs.com) framework

![npm (scoped)](https://img.shields.io/npm/v/@via-profit-services/core?color=blue)
![NPM](https://img.shields.io/npm/l/@via-profit-services/core?color=blue)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@via-profit-services/core?color=green)

## TODO

 - [ ] - Recipes

## Table of Contents

 - [Dependencies](#dependencies)
 - [Description](#description)
 - [Installation](#installation)
 - [Getting Started](#getting-started)
 - [Options](#options)
 - [Scalars](#scalars)
 - [Base TypeDefs](#base-typedefs)
 - [Connections](#connections)
 - [API](#api)
 - [Middleware](#middleware)
 - [Context](#context)

## <a name="dependencies"></a> Dependencies (peer)

 - [Express](https://github.com/expressjs/express) - Node HTTP Server
 - [Moment](https://github.com/moment/moment) - Date library
 - [Moment Timezone](https://github.com/moment/moment-timezone) - Time zone support for Moment


## <a name="description"></a> Description
Lightweight, flexible, standalone implementation of a [GraphQL HTTP (express middleware)](https://github.com/graphql/express-graphql) which allows you to run an Express GraphQL server, build connections with pagination (Cursored or Limit-offset type), make your own extentions, read detailed logs, use global context with structured dataloaders and module containers, use some extra GraphQL Scalar types as DateTime, Money and so on


List of our extentions:

 - [accounts](https://github.com/via-profit-services/accounts) This package allows you to store and operate with user accounts and make user authorization. Very useful
 - [permissions](https://github.com/via-profit-services/permissions) Standalone and lightweight implementation of [graphql-shield](https://github.com/maticzav/graphql-shield). Beacuse we found it slow.
 - [knex](https://github.com/via-profit-services/knex) Adds some useful properties into global context like DB connection instance
 - [geography](https://github.com/via-profit-services/geography) Helps you to deal with cities, states and countries. All data included
 - [subscriptions](https://github.com/via-profit-services/subscriptions) This package manage GrahpQL subscriptions
 - [file-storage](https://github.com/via-profit-services/file-storage) This package helps you to manage files, perporm image transformation, cropping
 - [vehicles](https://github.com/via-profit-services/vehicles) This package allows you to store and operate with vehicles data like model and brands. All data included
 - [phones](https://github.com/via-profit-services/phones) This package allows you to store and operate with phone numbers
 - [redis](https://github.com/via-profit-services/redis) Adds some useful properties into global context like Redis connection instance

 You can discover a full list of extentions in our organisation repository [via-profit-services](https://github.com/via-profit-services)

We always use those package in our commercial projects like CRM systems, websites and so on. Any help with development, testing and docs would be highly appreciated.
Our contacts:

LLC Via-Profit
 - website: [via-profit.ru](https://via-profit.ru/)
 - location: Russia, Yekaterinburg
 - email: 1@e1g.ru


## <a name="installation"></a> Installation

First of all you should install some peer dependencies by running:

```bash
$ yarn add \
express \
graphql \
moment \
moment-timezone \
@via-profit-services/core
```

And that's it. Let's write some code.
## <a name="getting-started"></a> Getting Started

To build your first project you should do some things:
##
  - Make your GraphQL schema
  - Create an http server
  - Apply middleware


Let's make it

_Note: You can see this example as Javascript in [examples/simple](./examples/simple/README.md)_

```ts
import express from 'express';
import http from 'http';
import { factory } from '@via-profit-services/core';

import schema from './schema';

(async () => {
  const port = 9005;
  const app = express();
  const server = http.createServer(app);

  const { graphQLExpress } = await factory({
    server,
    schema,
  });

  app.use('/graphql', graphQLExpress);

  server.listen(port, () => {
    console.info(`GraphQL server started at http://localhost:${port}/graphql`);
  });

})();

```

We strongly recommend using [@graphql-tools](https://github.com/ardatan/graphql-tools) package to build your schemas. This package helps to combine SDL and resolvers into a single executable schema. See `makeExecutableSchema` of `@graphql-tools/schema` module. For more details: [example with graphql-tools](./examples/graphql-tools/README.md)

Core module also exports its own typeDefs and resolvers. Those definitions would declare Query and Mutation root types.

```ts
import express from 'express';
import http from 'http';
import { factory, typeDefs, resolver } from '@via-profit-services/core';
import { makeExecutableSchema } from '@graphql-tools/schema';

import customTypeDefs from 'schema.graphql';
import customResolvers from './resolvers';

(async () => {
  const port = 9005;
  const app = express();
  const server = http.createServer(app);

  // make schema by graphql-tools
  const schema = makeExecutableSchema({
    typeDefs: [
      customTypeDefs,// <-- Put your custom SDL here
      typeDefs, // <-- Put here the base core type definitions
    ],
    resolvers: [
      customResolvers, // < -- Put your custom resolvers here
      resolvers,  // <-- put here the base core resolvers
    ],
  });

  const { graphQLExpress } = await factory({
    server,
    schema,
  });

  app.use('/graphql', graphQLExpress);

  server.listen(port, () => {
    console.info(`GraphQL server started at http://localhost:${port}/graphql`);
  });

})();
```


## <a name="options"></a> Options

 - **server** *(required)*. `http.Server`. Instance of http.Server
 - **schema** *(required)* `GraphQLSchema`. GraphQL schema
 - **timezone**. `string`. Server timezone. _Default: `UTC`_
 - **logDir**. `string` Path to directory of logs. _Default: `./log`_
 - **debug**. `boolean` Displayed error stack and extensions in graphql response. _Default: `false` for production and `true` for development mode_
 - **rootValue**. `any` GraphQL parameter of [execute](https://graphql.org/graphql-js/execution/#execute) method.
 - **middleware** `Middleware | Middleware[]` - Middleware or array of middlewares. See [Middleware](./#middleware)
 - **persistedQueriesMap** `Record`. Persisted Queries map (Object contains key: value pairs). See [Relay Persisted Queries](https://relay.dev/docs/en/persisted-queries.html). If persisted queries map is passed, the server will ignore the `query` directive in body request and read the map using the `documentId` key, unless otherwise specified (_see `persistedQueryKey` option_).
 - **persistedQueryKey** `string`. Used only together with the `persistedQueriesMap` option. The name of the parameter that will be passed the ID of the query in the Persisted Queries map. _Default: `documentId`_



## <a name="scalars"></a> Scalars

The Core also adds scalar types:

 - **Money** - The value is stored in the smallest monetary unit (kopecks, cents, etc.). Real type - Int. E.g. For 250 USD this record returns value as 250000 (250$ * 100¢)
 - **DateTime** - Use JavaScript Date object for date/time fields.
 - **Date** - Use JavaScript Date object for date fields.
 - **Time** - And Time type.
 - **URL** - A field which value conforms to the standard URL format as specified in [RFC3986](https://www.ietf.org/rfc/rfc3986.txt).
 - **EmailAddress** - A field which value conforms to the standard internet email address format as specified in [RFC822](https://www.w3.org/Protocols/rfc822/).
 - **JSON** - The JSON scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
 - **JSONObject** - The JSONObject scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
 - **Void** - Represents NULL values


## <a name="base-typedefs"></a> Base TypeDefs

The Core also adds GraphQL types:
 - *interface* **Node** - entity with required field: `id`. Used in Edges
 - *type* **OrderDirection** - Enum type to make the order (ASC, DESC)
 - *type* **Error** - entity fo display errors
 - *type* **PageInfo** - See [Connection spec.](https://relay.dev/graphql/connections.htm)
 - *interface* **Edge** - See [Connection spec.](https://relay.dev/graphql/connections.htm)
 - *interface* **Connection** - See [Connection spec.](https://relay.dev/graphql/connections.htm)
 - *input* **BetweenDate** - Between `Date` query type
 - *input* **BetweenTime** - Between `Time` query type
 - *input* **BetweenDateTime** - Between `DateTime` query type
 - *input* **BetweenInt** - Between `Int` query type
 - *input* **BetweenMoney** - Between `Money` query type


## <a name="connections"></a> Connections

To implement connections, according to the GraphQL [Connection specification](https://relay.dev/graphql/connections.htm), you can use the types and functions included in the package:

In schema (SDL):

**Note:** _GraphQL types `OrderDirection`, `Connection`, `PageInfo`, `Edge` and `Node` already declared in Core typedefs (see: [Base TypeDefs](#base-typedefs))_

```graphql
type Query {
  list(
    first: Int
    offset: Int
    after: String
    orderBy: [UserOrderBy!]
    between: UsersListBetween
    search: [UserFilterSearch!]
    filter: UserListFilter
  ): UserListConnection!
}

"""
Example of User type
"""
type User {
  id: ID!
  name: String!
  login: String!
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
  login
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
  login
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

In resolvers:

```ts
import { GraphQLFieldResolver } from 'graphql';
import { ServerError, buildCursorConnection, buildQueryFilter, CursorConnection, Context, InputFilter } from '@via-profit-services/core';

type Resolvers = {
  Query: {
    list: GraphQLFieldResolver<unknown, Context, InputFilter>;
  },
};

const resolvers: Resolvers = {
  Query: {
    list: async (_parent, args, context) => {
      // convert input arguments to persist filter (See return value of this method)
      // Will be return `OutputFilter` type with normalized props
      // You can use this filter in your Model class
      const filter = buildQueryFilter(args);

      // Your model should return the data for the connection
      // You must provide totalCount and nodes yourself
      // limit, offset, and others can be returned
      // in the same form as received from the buildQueryFilter method
      // to simplify the selection from the database using filters, you
      // can use the package https://github.com/via-profit-services/knex
      const { totalCount, nodes, limit, offset, offset, where } = MyModelClass.getUsers(filter);

      // Now you can build the conection object like this:
      // method buildCursorConnection combine and return edges,
      // pageInfo and totalCount values
      const connection = buildCursorConnection({
        totalCount,
        nodes,
        limit,
        offset,
        offset,
        where,
      });

      return connection;
    },
  },
};

export default resolvers;

```


## <a name="api"></a> API

You can use helpers by exporting them from the module:

```ts
import { factory, resolvers, logFormatter, buildQueryFilter } from '@via-profit-services/core';
```

### factory

Function returns object contains `graphQLExpress` - express middleware.

_Example of usage:_

```ts
import { factory } from '@via-profit-services/core';
import express from 'express';
import http from 'http';

const server = http.createServer();
const app = express();
const { graphQLExpress } = factory({
  server,
  schema,
});

app.use('/graphql', graphQLExpress);
server.listen(9000);
```

### resolvers

Resolvers object contains:
 - [Scalars](#scalars) resolvers
 - Root `Query` resolvers
   - `core` - Returns core version
 - Root `Mutation` resolvers
   - `echo` - Returns passed string

### typeDefs

`SDL` string with definitions of [Scalars](#scalars) and [Base TypeDefs](base-typedefs)

### defaultOutputFilter

`OutputFilter` containing the default values

### buildQueryFilter

Convert input filter (partial from GraphQL request) into persist filter

### arrayOfIdsToArrayOfObjectIds

Format array of IDs into object with id key

```ts
const ids = arrayOfIdsToArrayOfObjectIds(['1', '2', '3']);

console.log(ids); // <-- [{id: '1'}, {id: '2'}, {id: '3'}]
```

### collateForDataloader

Collate rows for dataloader response
*From DataLoader docs:*
There are a few constraints this function must uphold:
  - The Array of values must be the same length as the Array of keys.
  - Each index in the Array of values must correspond to the same index in the Array of keys.
For details [here](https://github.com/graphql/dataloader#batch-function)

```ts
const dataloader = new DataLoader(async (ids: string[]) => {
  const nodes = await context.services.accounts.getUsersByIds(ids);

  return collateForDataloader(ids, nodes);
});
```

### extractNodeIds

Returns node IDs array

```ts
const ids = extractNodeIds([
  {id: '1', name: 'Ivan'},
  {id: '2', name: 'Stepan'},
  {id: '3', name: 'Petruha'},
]);

console.log(ids); // <-- ['1', '2', '3'];
```


### extractNodeField

Return array of fields of node

```ts
const persons = [
  {id: '1', name: 'Ivan'},
  {id: '2', name: 'Stepan'},
  {id: '3', name: 'Petruha'},
];

const names = extractNodeField(persons, 'name');
console.log(names); // <-- ['Ivan', 'Stepan', 'Petruha']
```


### nodeToEdge

Wrap node to cursor object

```ts
const filter = {
  offset: 0,
  limit: 15,
  where: [],
  orderBy: [{
    field: 'name',
    direction: 'desc',
  }],
}

// Get persons list
const persons = await service.getPersons(filter);

// Map all persons to compile the edge for each
const edges = persons.map((person) => {

  // You should passed node, cursor name and filter params
  return nodeToEdge(person, 'persons-cursor', filter);
});
console.log(edges); // <-- [{ cursor: 'XGHJGds', node: { id: '1', name: 'Ivan' } }]

```

### stringToCursor

Just encode base64 string
_Internal function. Used for GraphQL connection building_

```ts
const cursor = stringToCursor(JSON.stringify({ foo: 'bar' }));
console.log(cursor); // <-- eyJmb28iOiJiYXIifQ==
```

### cursorToString

Just decode base64 string
_Internal function. Used for GraphQL connection building_

```ts
const data = cursorToString('eyJmb28iOiJiYXIifQ==');
console.log(data); // <-- '{"foo":"bar"}'
```

### makeNodeCursor

Returns cursor base64 cursor string by name and cursor payload

```ts
const cursor = makeNodeCursor('persons-cursor', {
  offset: 0,
  limit: 15,
  where: [],
  orderBy: [{
    field: 'name',
    direction: 'desc',
  }],
});
console.log(cursor); // <-- eyJvZmZzZXQiOjAsImxpbWl0IjoxNSwid2hlcmUiOltdLCJvcmRlckJ5IjpbeyJmaWVsZCI6Im5hbWUiLCJkaXJlY3Rpb24iOiJkZXNjIn1dfS0tLXBlcnNvbnMtY3Vyc29y
```

### getCursorPayload

Convert string to cursor base64 string and return payload

```ts
const payload = getCursorPayload('eyJvZmZzZXQiOjAsImxpbWl0IjoxNSwid2hlcmUiOltdLCJvcmRlckJ5IjpbeyJmaWVsZCI6Im5hbWUiLCJkaXJlY3Rpb24iOiJkZXNjIn1dfS0tLXBlcnNvbnMtY3Vyc29y')
console.log(payload);
/**
 * {
 *   offset: 0,
 *   limit: 15,
 *   where: [],
 *   orderBy: [ { field: 'name', direction: 'desc' } ]
 * }
 */
```

### buildCursorConnection

Returns Relay cursor bundle

```ts
const cursorBundle = buildCursorConnection({
  totalCount: 3,
  offset: 0,
  limit: 2,
  nodes: [
    { id: '1', name: 'Ivan', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Stepan', createdAt: new Date(), updatedAt: new Date() },
  ]
}, 'persons-cursor');

console.log(cursorBundle);
/**
 * {
 *   totalCount: 3,
 *   edges: [
 *     {
 *       node: { id: '1', name: 'Ivan', ... },
 *       cursor:  'eyJvZmZzZXQiOjEsImxpbWl0Ijoy...'
 *     },
 *     {
 *       node: { id: '2', name: 'Stepan', ... },
 *       cursor:  'eyJvZmZzZXQiOjIsImxpbWl0Ij...'
 *     }
 *   ],
 *   pageInfo: {
 *     startCursor:  'eyJvZmZzZXQiOjEsImxpbWl0Ijoy...',
 *     endCursor:  'eyJvZmZzZXQiOjIsImxpbWl0Ij...',
 *     hasPreviousPage: false,
 *     hasNextPage: true
 *   }
 * }
 */
```

### extractKeyAsObject

Creates an object which contains a specific key

```ts
const source = {
  foo: 'Foo',
  bar: 12,
};
const record = extractKeyAsObject(source, 'bar');

console.log(record); // <-- { bar: 12 }
```

### fieldsWrapper

Wrap types resolvers in schema. You can wrap types without resolvers - will be created noop-resolver to wrap the field.

**Note:** The resolver function should return all the received parameters.

```ts
const { graphQLExpress } = await factory({
  server,
  schema,
  middleware: [
    ({ schema }) => ({
      schema: fieldsWrapper(schema, (params) => {
        const { resolver, source, args, context, info } = params;
        // Do something

        return params;
      })
    }),
  ],
});
```

## <a name="middleware"></a> Middleware

Middleware is a special function that allows you to expand the GraphQL **Context** by adding new parameters into it, as well as performing GraphQL validation at the [ValidationRule](https://graphql.org/graphql-js/validation/). In addition, you can modify the current GraphQL scheme.

Middleware factory function will be called on **every GraphQL request**. Keep it in mind. When calling function, it would passed a set of parameters which contains a current context value, current schema, http request and so on. The function could return nothing or return the modified value of one of the parameters.

_Note: Middlewares order. Since each middleware mutates the context and returns it back. The presence of a property parameter in the context will depend on each of these middleware._

Will be passed:
  - **config** - Parameters that were passed during core factory called.
  - **context** - The current context value returned from the previous middleware, or the default context value if no middleware has been executed before.
  - **schema** - The current GraphQL schema returned from the previous middleware, or the initial schema if no middleware has been executed before.
  - **extensions** - The current Extensions object returned from the previous middleware, or the initial extensions if no middleware has been executed before.
  - **request** - HTTP request (`Express.Request`)

Possible return:
 - **context** - You should mutated this context value. **Not override and not merge with spread operator**.
 - **schema** - You should mutated this schema value. **Not override and not merge with spread operator**.
 - **extensions** - You should mutated this schema value. **Not override and not merge with spread operator**.
 - **validationRule** - You can return GraphQL validation rule or array of validation rules. All rules that will be returned from middlewares will be concatenated and passed to GraphQL `execute` method

_Note: Use wrapper function to make closure and cache._

To create your simple middleware you can see this example:

```ts
import { factory, Middleware } from '@via-profit-services/core';

// function wrapper
const customMiddlewareFactory = () => {

  // Middleware factory which should passed to middleware props
  const middleware: Middleware = ({ context }) => {

    // Inject custom propertied into context
    context.myCustomContextProp = context.myCustomContextProp { 
      foo: 'The Foo',
    }

    // Do not forget return it
    return {
      context,
    };
  };

  return middleware;
}

const { graphQLExpress } = await factory({
  server,
  schema,
  middleware: [
    customMiddlewareFactory(),
  ],
});
```

**Warning! Do not use spread operator while combining old current context and new context value. See example below:**

_Warning! This code is not valid_
```ts
// !!! This code is not valid
const middleware: Middleware = ({ context }) => ({
  ...context,
  myCustomContextProp: {
    foo: 'bar',
  }
}));
```

For TypeScript you can expand the types using the Declaration files `*.d.ts`.
Now you can use TypeScript autocompletion in the IDE, which will contain the current Core types with your custom types.

```ts
declare module '@via-profit-services/core' {
  // extend standard Context object
  interface Context {
    myCustomContextProp: {
      foo: string;
    }
  }

  // extend standard services collection
  interface ServicesCollection {
    myService: MyServiceClass;
  }

}

```


## <a name="context"></a> Context

Default state of GraphQL [Context](https://graphql.org/learn/execution/):

 - **timezone** - Provied with initial properties (See [API](#options)) .Default: `UTC`.
 - **services** - Provied with collection of any services that you make (See [Middleware](#middleware))
 - **emitter** - Provied with Event Emitter class (See [EventEmitter](#event-emitter))
 - **request** - Provied with Express server request (See [Express API](https://expressjs.com/ru/api.html#req))
 - **schema** - Provied with GraphQL current schema

You can extend default context value. See [Middleware](#middleware) section for more details.



## <a name="event-emitter"></a> Event Emitter

Context contains the `emitter` property by default - [Event Emitter](https://nodejs.org/api/events.html) this class are empty by deafult. You can extend it


## <a name="license"></a> License

The  [MIT](./LICENSE) License.

