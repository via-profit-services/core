## API

You can use helpers by exporting them from the module:

```js
import { factory, resolvers, buildQueryFilter } from '@via-profit-services/core';
```

## Table of contents

 - [factory](#factory)
 - [resolvers](#resolvers)
 - [typeDefs](#typedefs)
 - [defaultOutputFilter](#defaultoutputfilter)
 - [buildQueryFilter](#buildqueryfilter)
 - [arrayOfIdsToArrayOfObjectIds](#arrayofidstoarrayofobjectids)
 - [collateForDataloader](#collatefordataloader)
 - [extractNodeIds](#extractnodeids)
 - [extractNodeField](#extractnodefield)
 - [nodeToEdge](#nodetoedge)
 - [stringToCursor](#stringtocursor)
 - [cursorToString](#cursortostring)
 - [makeNodeCursor](#makenodecursor)
 - [getCursorPayload](#getcursorpayload)
 - [buildCursorConnection](#buildcursorconnection)
 - [extractKeyAsObject](#extractkeyasobject)
 - [fieldsWrapper](#fieldswrapper)
 - [fieldBuilder](#fieldbuilder)


### factory


Function returns object contains `graphQLExpress` - express middleware.

Arguments:
 - An object containing:
  - `server` **required** **http.Server** - HTTP server instance.
  - `schema` **required** **GraphQLSchema** - GraphQL Schema Definition. See [graphql.org](https://graphql.org) for more information.
  - `timezone` **String** - Server timezone. Default: `UTC`.
  - `debug` **Boolean** - Debug mode. Default: `false`.
  - `rootValue` **Object** - GraphQL Root resolver.
  - `persistedQueriesMap` **Object** - Persisted Queries map (Object contains key: value pairs). If persisted queries map is passed, the server will ignore the query directive in body request and read the map [Relay persisted-queries](https://relay.dev/docs/en/persisted-queries.html).
  - `persistedQueryKey` **String** - Used only together with the `persistedQueriesMap` option. The name of the parameter that will be passed the ID of the query in the Persisted Queries map. Default: `documentId`.
  - `middleware` **Middleware | Middleware[]** - Middlewares. See [middleware documentation](./middlewares.md) for more details.

Returns:
  ExpressJs middleware

_Example of usage:_

```js
const { factory } = require('@via-profit-services/core');
const express = require('express');
const http = require('http');

(async () => {
  const app = express();
  const server = http.createServer(app);
  const port = 8080;

  const { graphQLExpress } = await core.factory({
    server,
    schema
  });

  app.use("/graphql", graphQLExpress);

  server.listen(port, () => {
    console.info(`GraphQL server started at http://localhost:${port}/graphql`);
  });
})();
```

### resolvers

Resolvers object contains:
 - [Scalars](#scalars) resolvers
 - Root `Query` resolvers
   - `core` - Returns core version
 - Root `Mutation` resolvers
   - `echo` - Returns passed string

### typeDefs

`SDL` string with definitions of [Scalars](./typedefs.md#scalars) and [Base TypeDefs](./typedefs.md#types)

### defaultOutputFilter

`OutputFilter` containing the default values

### buildQueryFilter

Convert input filter (partial from GraphQL request) into persist filter.

This method takes an object of type `InputFilter` with optional keys and returns an object of type` OutputFilter` in which all keys will be present. It is important to note that some keys will be transformed or replaced. So for example, the key `filter`, which is an object, will be replaced with an array of arrays named` where`. This is done primarily for ease of use.

Arguments:
  - An object containing:
    - `first` - Number of items requested per result page. `Number`.
    - `last` - Number of end-of-line items requested on the results page. `Number`.
    - `offset` - Number of elements to skip before fetching page. `Number`.
    - `before` - ds `String`.
    - `after` - Cursor, from which the selection of results will be performed using pagination on cursors `String`.
    - `before` - Cursor, starting from which the selection of results will be performed in the opposite direction using pagination on cursors. `String`.
    `orderBy` - Array of objects for sorting:
      - `field` **required** - Field name
      - `direction` **required** - One of values: `ASC` or `DESC`.
    `search` - Array of objects for search:
      - `field` **required** - Field name
      - `query` **required** - Search query string.
    `between` - An object containing the query parameters `between`:
       - `start` **required** - string or number or date.
       - `end` **required** - string or number or date.
    `filter` - Object with custom filter values

The `search` key can accept not only an array of objects, but also the following data:

```js

// Variant 1. Search accept object
const filter = buildQueryFilter({
  search: {
    field: 'name',
    query: 'Leo',
  },
});

// Variant 2. Search accept array of objects
const filter = buildQueryFilter({
  search: [
    {
      field: 'name',
      direction: 'Leo',
    },
    {
      field: 'lastname',
      direction: 'Ninja',
    },
  ],
});

// Variant 3. Search accept object
const filter = buildQueryFilter({
  search: {
    fields: ['name', 'lastname'],
    direction: 'Leo',
  },
});

// Variant 4. Search accept array of objects
const filter = buildQueryFilter({
  search: [
    {
      fields: ['name', 'lastname'],
      direction: 'Leo',
    },
    {
      fields: ['email', 'domain'],
      direction: 'exampe.com',
    },
  ],
});
```


_Note: You can use `first` with `after` or `last` with `before`. And you can use `first` with `offset` or `last` with `offset`._

Returns:
  - An object containing:
    - `limit` **permanent** - Limit of the results needed
    - `offset` **permanent** - Start offset of the results needed
    - `revert` **permanent** - Will be `true` if Input filter contain `last` or `before` parameters and will be `false` otherwise.
    - `where` **permanent** - Array of tuples. Each tuple contains: field name; logical operator; value. See example below.
    - `search` **permanent** - false or Array of objects:
      - `field` **permanent** - Search field name
      - `query` **permanent** - Search query string
    - `between` **permanent** - An object containing the query parameters `between`:
      - `start` **permanent** - string or number or date.
      - `end` **permanent** - string or number or date.

### where

Where - is an array of turle. Each tuple contains: field name, logical operator and value.

Where clause structure:

```ts
type Where = WhereField[];
type WhereField = [string, WhereAction, WhereValue];
type WhereAction =
  | '='
  | '<>'
  | '>'
  | '<'
  | '>='
  | '<='
  | 'in'
  | 'notIn'
  | 'like'
  | 'ilike'
  | 'is null'
  | 'is not null';
type WhereValue =
  | string
  | number
  | boolean
  | null
  | readonly string[]
  | readonly number[]
  | undefined;
```

Example 1 of `where` key:

```js
const { where } = buildQueryFilter({
  filter: {
    status: 'accepted',
  },
});

console.log(where);
/**
 * [['status', '=', 'accetped']]
 * /
```
Example 2 of `where` key:

```js
const { where } = buildQueryFilter({
  filter: {
    status: ['accepted', 'aborted'],
    category: 21,
  },
});

console.log(where);
/**
 * [
 *   ['status', 'in', ['accetped', 'aborted']],
 *   ['category', '=', 21]
 * ]
 * /
```

Examples of where clause:

```js
['name', 'is not null', undefined] // eq: where name is not null
['name', '=', 'Michelangelo'] // eq: where name = 'Michelangelo'
['age', '>', 27] // eq: where age > 27
['id', 'in', [1, 5]] // eq: where id in (1, 5)
['id', 'notIn', [1, 5]] // eq: where id not in (1, 5)
['name', 'like', 'Michel%'] // eq: where name like 'Michel%'
```


_Example of SDL. Arguments of list field will be passed to `buildQueryFilter` method._

```graphql
type Query {
  list(
    first: Int
    last: Int
    after: String
    before: String
    orderBy: [UserOrderBy!]
    between: UsersListBetween
    search: [UserFilterSearch!]
    filter: UserListFilter
  ): UserListConnection!
}
```
_Full example of this SDL see [here](./connections.md)_


```js
const { buildQueryFilter, buildCursorConnection } = require("@via-profit-services/core");

const resolvers = {
  Query: {
    list: async (_parent, args, context) => {
      // convert input arguments to persist filter (See return value of this method)
      // Will be return `OutputFilter` type with normalized props
      // You can use this filter in your Model class
      const filter = buildQueryFilter(args);
      
      // Now you can use filter fo data fetching

    },
  },
};
```




### arrayOfIdsToArrayOfObjectIds

Format array of IDs into object with id key

Arguments:
 - `ids` **required** - Array of ids

Returns:
 - Array of objects. Each object contain single key `id`.

```js
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

Arguments:
 - `ids` **required** - array of ids.
 - `nodes` **required** - array of objects.
 - `keyName` - the name of the key, which should be considered an identifier. Default - `id`.

```js
const dataloader = new DataLoader(async ids => {
  const bananas = await context.services.fruits.getBananas(ids);

  return collateForDataloader(ids, bananas);
});
```

`collateForDataloader` takes 2 or 3 arguments. The third argument is the name of the key, which should be considered an identifier. Default - `id`:

```js
const dataloader = new DataLoader(async ids => {
  const bananas = await context.services.fruits.getBananas(ids);

  // bananas = [{ record: '1' }, { record: '2' }]

  return collateForDataloader(ids, bananas, 'record');
});
```



### extractNodeIds

Returns node IDs array

Arguments:
 - `nodes` **required** - Array of  objects containing at least the `id` key.

Returns:
 - Array of ids

```js
const ids = extractNodeIds([
  {id: '1', name: 'Leo'},
  {id: '2', name: 'Raph'},
  {id: '3', name: 'Mikey'},
]);

console.log(ids); // <-- ['1', '2', '3'];
```


### extractNodeField

Return array of fields of node


Arguments:
 - `nodes` **required** - array of objects.
 - `keyName` **required** - name of the extracted key.

Returns:
 - Array of values

```js
const persons = [
  {id: '1', name: 'Leo'},
  {id: '2', name: 'Raph'},
  {id: '3', name: 'Mikey'},
];

const names = extractNodeField(persons, 'name');
console.log(names); // <-- ['Leo', 'Raph', 'Mikey']
```


### nodeToEdge

Wrap node to cursor object

Arguments:
 - An object containing at least the `id` key.
 - Name of the cursor
 - Payload of the cursor

Returns:
 - Object containing:
   `cursor` - cursor string
   `node` - the value passed as the first argument

```js
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
const edges = persons.map(person => {

  // You should passed node, cursor name and filter params
  return nodeToEdge(person, 'persons-cursor', filter);
});
console.log(edges); // <-- [{ cursor: 'XGHJGds', node: { id: '1', name: 'Leo' } }]

```

### stringToCursor

Just encode base64 string
_Internal function. Used for GraphQL connection building_

Arguments:
  - `cursorPayload` - stringified cursor payload

Returns:
  - `cursor` - Cursor string


```js
const cursor = stringToCursor(JSON.stringify({ foo: 'bar' }));
console.log(cursor); // <-- eyJmb28iOiJiYXIifQ==
```

### cursorToString

Just decode base64 string
_Internal function. Used for GraphQL connection building_

Arguments:
  - `cursor` - Cursor string

Returns:
 - `cursorPayload` - stringified cursor payload

```js
const data = cursorToString('eyJmb28iOiJiYXIifQ==');
console.log(data); // <-- '{"foo":"bar"}'
```

### makeNodeCursor

Returns cursor base64 cursor string by name and cursor payload

Arguments:
 - `cursorName` - Name of the cursor
 - `cursorPayload` - Cursor payload object

Returns:
 - `cursor` - Cursor string

```js
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

Arguments:
  - `cursor` - Cursor string

Returns:
  - `cursorPayload` - Cursor payload object

```js
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

Arguments:
 - connectionParams - Object with connection parameters:
   - `totalCount` **required** - The total number of records matching the query
   - `limit` **required** - Limit of the results per page
   - `nodes` **required** - Rows. Array of nodes
   - `offset` - Query start offset
   - `orderBy` - Array of objects for sorting:
        - `field` **required** - Field name
        - `direction` **required** - One of values: `ASC` or `DESC`.
   - `where` - Array of tuples. Tuple is an array containing: field name; logical operator; value
 - `cursorName` - Name of the cursor.

Returns:
 - cursorConnection - Object containing:
    `totalCount` - The total number of records matching the query
    `pageInfo` - Object containing:
        - `startCursor` - Start cursot
        - `endCursor` - End cursor
        - `hasPreviousPage` - Will be true if request have previous results page or false otherwise
        - `hasNextPage` - Will be true if request have next results page or false otherwise
    `edges` - Array of objects containing:
       `node` - Node object.
       `cursor` - Cursor string.

```js
const cursorBundle = buildCursorConnection({
  totalCount: 3,
  offset: 0,
  limit: 2,
  nodes: [
    { id: '1', name: 'Leo', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Mikey', createdAt: new Date(), updatedAt: new Date() },
  ]
}, 'nonja-cursor');

console.log(cursorBundle);
/**
 * {
 *   totalCount: 3,
 *   edges: [
 *     {
 *       node: { id: '1', name: 'Leo', ... },
 *       cursor:  'eyJvZmZzZXQiOjEsImxpbWl0Ijoy...'
 *     },
 *     {
 *       node: { id: '2', name: 'Mikey', ... },
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

Arguments:
  - Object containing any data
  - The key by which the value will be extracted

Results:
 - Object containing only key with `keyName`.

```js
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

Arguments:
  - `schema` **required** - GraphQL schema
  - `wrapper` **required** - A function to be called with the argument containing:
    - `resolver` - Original GraphQL field resolver
    - `source` - Parent object
    - `args` - GraphQL resolver arguments if passed
    - `context` - [Context](./context) object
    - `info` - GraphQL info object
  - `options` - Options object containing:
    - `wrapWithoutResolvers` - boolean value. If true, the original resolvers will not be returned.

Returns:
 - GraphQL schema


```js
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

### fieldBuilder

Build GraphQL field resolver. This function takes as its first argument an array of keys of the Type that needs to be resolved. The second argument is the function to which the key name will be passed. The function should return a value of the type for this key.

This is useful when you need to modify  the resolver response.

Suppose you need to modify name of the user before response, but you can'n do this in `Query->user` resolver for some reason.

Arguments:
 **required** - An array of keys of the Type that needs to be resolved
 **required** - A function to be called with the argument containing:
   - `field` - Resolver field name. The function should return a value of the type for this key

Returns:
 - An object where each key is a graphql resolver
 

Schema:

```graphql
type Query {
  user(id: ID!): User
}

type User {
  id: ID!
  firstname: String!
  lastname: String!
  email: String!
}
```

Then In this case, the resolver will look like this (not usage `fieldBuilder`):

```js
const resolvers = {
  Query: {
    user: async (_, args) => UserModel.getUser(args.id),
  },
  user: {
    id: ({ id }) => id,
    email: ({ email }) => email,
    firstname: ({ id, firstname }) => id === 'e16329cd' ? firstname.toUpperCase() : firstname,
    lastname: ({ id, lastname }) => id === 'e16329cd' ? lastname.toUpperCase() : lastname,
  },
};
```
If you use `fieldBuilder`:

```js
const resolvers = {
  Query: {
    user: async (_, args) => UserModel.getUser(args.id),
  },
  user: fieldBuilder(
    ['id', 'firstname', 'lastname', 'email'],
    field => (parent, args, context) => {
      if (parent.id === 'e16329cd' && ['firstname', 'lastname'].includes(field)) {
        return parent[field].toUpperCase();
      }

      return parent[field];
    },
  ),
};
```
