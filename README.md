# Via Profit Services / Core

![via-profit-services-cover](./assets/via-profit-services-cover.png)

> Via Profit services / **Core** - [GraphQL](https://graphql.org/) server based on [Express](http://expressjs.com) framework

![npm (scoped)](https://img.shields.io/npm/v/@via-profit-services/core?color=blue)
![NPM](https://img.shields.io/npm/l/@via-profit-services/core?color=blue)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@via-profit-services/core?color=green)

## Table of Contents

 - [Dependencies](#dependencies)
 - [Installation](#installation)
 - [Getting Started](#getting-started)
 - [Options](#options)
 - [Scalars](#scalars)
 - [Base TypeDefs](#base-typedefs)
 - [API](#api)
 - [logger](#Logger)
 - [Middleware](#middleware)
 - [Context](#context)

## <a name="dependencies"></a> Dependencies (peer)

 - [Express](https://github.com/expressjs/express) - Node HTTP Server
 - [DataLoader](https://github.com/graphql/dataloader) - GraphQL DataLoader
 - [Moment](https://github.com/moment/moment) - Date library
 - [Moment Timezone](https://github.com/moment/moment-timezone) - Time zone support for Moment
 - [Winston](https://github.com/winstonjs/winston) - Logger
 - [Winston Daily Rotate File](https://github.com/winstonjs/winston-daily-rotate-file) - A transport for winston which logs to a rotating file

## <a name="installation"></a> Installation

At first you need to install the peer dependencies to:

```bash
$ yarn add \
express \
graphql \
dataloader \
moment \
moment-timezone \
winston \
winston-daily-rotate-file \
@via-profit-services/core
```


## <a name="getting-started"></a> Getting Started

To get started, make your GraphQL schema, create an http server and apply middleware.

_Node: You can see this example as Javascript in [examples/simple](./examples/simple/README.md)_

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
    introspection: true,
    server,
    schema,
  });

  app.use('/graphql', graphQLExpress);

  server.listen(port, () => {
    console.info(`GraphQL server started at http://localhost:${port}/graphql`);
  });

})();

```

We recommend using the [@graphql-tools](https://github.com/ardatan/graphql-tools) package to build youк schema. This helps to combine SDL and resolvers into a single executable schema. See `makeExecutableSchema` of `@graphql-tools/schema` module. For more details: [example with graphql-tools](./examples/graphql-tools/README.md)

In addition to the `factory`, the Core module exports its own typeDefs and resolvers. This definitions will be declare Query and Mutation root types.

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
    introspection: true,
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

 - **server** *(required)*. Instance of http.Server
 - **schema** *(required)*. GraphQL schema
 - **timezone**. `String`. Server timezone. _Default: `UTC`_
 - **logDir**. `String` Path to directory of logs. _Default: `./log`_
 - **introspection**. `Boolean`. Allow/Disallow introspection queries. _Default: `false`_
 - **debug**. `Boolean` Displayed error stack and extensions in graphql response. _Default: `false` for production and `true` for development mode_
 - **rootValue**. `Object` GraphQL parameter of [execute](https://graphql.org/graphql-js/execution/#execute) method.
 - **middleware** - Middleware or array of middlewares. See [Middleware](./#middleware)



## <a name="scalars"></a> Scalars

The Core also adds scalar types:

 - **Money** - The value is stored in the smallest monetary unit (kopecks, cents, etc.). Real type - Int. E.g. For 250 USD this record returns value as 250000 (250$ * 100¢)
 - **DateTime** - Use JavaScript Date object for date/time fields.
 - **Date** - Use JavaScript Date object for date fields.
 - **Time** - Time type.
 - **URL** - A field whose value conforms to the standard URL format as specified in [RFC3986](https://www.ietf.org/rfc/rfc3986.txt).
 - **EmailAddress** - A field whose value conforms to the standard internet email address format as specified in [RFC822](https://www.w3.org/Protocols/rfc822/).
 - **JSON** - The JSON scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
 - **JSONObject** - The JSONObject scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).


## <a name="base-typedefs"></a> Base TypeDefs

The Core also adds GraphQL types:
 - *interface* **Node** - entity with required fields: `id`, `createdAt` and `updatedAt`. Used in Edges
 - *type* **OrderDirection** - Enum type to make the order (ASC, DESC)
 - *type* **PageInfo** - See [Connection spec.](https://relay.dev/graphql/connections.htm)
 - *interface* **Edge** - See [Connection spec.](https://relay.dev/graphql/connections.htm)
 - *interface* **Connection** - See [Connection spec.](https://relay.dev/graphql/connections.htm)



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
 - Root `Mutation` resolvers
 - Resolvers of `InfoQuery`
 - Resolvers of `InfoMutation`

### typeDefs

`SDL` string with definitions of [Scalars](#scalars) and [Base TypeDefs](base-typedefs)

### logFormatter

[Winston](https://github.com/winstonjs/winston#combining-formats) Combining formats data to use in loggers

### buildQueryFilter

Convert input filter (partial from GraphQL request) to persist filter

### arrayOfIdsToArrayOfObjectIds

Format array of IDs to object with id key

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
const ids = extractNodeField([
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


### LOG_FILENAME_DEBUG

Contains filename of logger debug level (`debug-%DATE%.log`).

### LOG_FILENAME_ERRORS

Contains filename of logger error level (`errors-%DATE%.log`).

### LOG_FILENAME_WARNINGS

Contains filename of logger warning level (`warnings-%DATE%.log`).

### LOG_DATE_PATTERNT

Contains log date pattern string (`YYYY-MM-DD`).

### LOG_MAX_SIZE

Contains log date pattern string (`YYYY-MM-DD`).


## <a name="Logger"></a> logger

Logger - is a [Winston](https://github.com/winstonjs/winston) logger instance.

Logger storage in Context only. By default context object contains *server* logger with transports:

  - `warn` - File transport
  - `error` - File transport
  - `debug` - File transport

_Example of usage in some resolver:_
```ts

const accountsQueryResolver = {
  accountsList: async (parent, args, context) => {
    const { logger } = context;

    logger.server.debug('Some debug message');

    ...
  }
}
```

## <a name="middleware"></a> Middleware

Middleware is a special function that allows you to expand the GraphQL **Context** by adding the new parameters to it, as well as performing GraphQL validation at the [ValidationRule](https://graphql.org/graphql-js/validation/). In addition, you can modify the current GraphQL scheme.

Middleware factory function will be called on **every GraphQL request**. Keep this in mind. When calling the function, it will be passed a set of parameters containing the current context value, the current schema, http request and more. The function may return nothing or return the modified value of one of the parameters.

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

  const middlewareCache: ReturnType<Middleware> = {
    context: null,
  }

  // Middleware factory which should passed to middleware props
  const middleware: Middleware = ({ context }) => {

    // Check and return if it filled
    if (middlewareCache.context) {
      return middlewareCache;
    }

    // Inheriting the current context value
    middlewareCache.context = context;

    // Inject custom propertied into context
    middlewareCache.context.myCustomContextProp = {
      foo: 'bar',
    }

    // Do not forget return it
    return middlewareCache;
  };

  return middleware;
}

const { graphQLExpress } = await factory({
    introspection: true,
    server,
    schema,
    middleware: [
      customMiddlewareFactory(),
    ],
  });
```

**Warning! Do not use spread operator while you be combine old current context and new context value. See example below:**

_Warning! This code is not valid_
```ts
// ! This code is not valid
const middleware: Middleware = ({ context }) => ({
  ...context,
  myCustomContextProp: {
    foo: 'bar',
  }
}));
```

For TypeScript you can expand the types using the Declaration files `*.d.ts`.
Now you can use TypeScript autocompletion in the IDE, which will contain the current Core types together with the your custom.

```ts
declare module '@via-profit-services/core' {

  interface Context {
    myCustomContextProp: {
      foo: string;
    }
  }
}

```


## <a name="context"></a> Context

Default state of GraphQL [Context](https://graphql.org/learn/execution/):

 - **timezone** - Provied from initial properties (See [API](#options)) .Default: `UTC`.
 - **logger** - Provied Winston loaders collection (See [Logger](#logger))
 - **dataloader** - Provied DataLoader loader (See [Middleware](#middleware))
 - **services** - Provied collection of any services (See [Middleware](#middleware))

You can extend default context value. See [Middleware](#middleware) section for more details.


## <a name="license"></a> License
The  [MIT](./LICENSE) License.

