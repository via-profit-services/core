## Middlewares

## Table of contents

- [Overview](#overview)
- [Example](#example)
- [Typescript](#typescript)
- [RequestCounter property](#requestcounter-property)

## Overview

Middleware is a special function that allows you to expand the GraphQL [Context](./context.md) by adding new parameters into it, as well as performing GraphQL validation at the [ValidationRule](https://graphql.org/graphql-js/validation/). In addition, you can modify the current GraphQL scheme.

Middleware factory function will be called on **every GraphQL request**. Keep it in mind. When calling function, it would passed a set of parameters which contains a current context value, current schema, http request and so on. The function could return nothing or return the modified value of one of the parameters.

_Note: Middlewares order. Since each middleware mutates the context and returns it back. The presence of a property parameter in the context will depend on each of these middleware._

Will be passed:
  - **config** - Parameters that were passed during core factory called.
  - **context** - The current context value returned from the previous middleware, or the default context value if no middleware has been executed before.
  - **schema** - The current GraphQL schema returned from the previous middleware, or the initial schema if no middleware has been executed before.
  - **extensions** - The current Extensions object returned from the previous middleware, or the initial extensions if no middleware has been executed before.
  - **request** - HTTP request (`Express.Request`)
  - **requestCounter** - HTTP request counter

Possible return:
 - **context** - You should mutated this context value. **Not override and not merge with spread operator**.
 - **schema** - You should mutated this schema value. **Not override and not merge with spread operator**.
 - **extensions** - You should mutated this schema value. **Not override and not merge with spread operator**.
 - **validationRule** - You can return GraphQL validation rule or array of validation rules. All rules that will be returned from middlewares will be concatenated and passed to GraphQL `execute` method

## Example

To create your simple middleware you can see this example:

_index.js_

```js
const { graphQLExpress } = await factory({
  server,
  schema,
  middleware: [
    (props) => {
      const { context } = props;
      context.myCustomProperty = "myCustomValue";

      return {
        context
      };
    }
  ]
});
```

_schema.js_

```js
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: () => ({
      getPropFromContext: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (parent, args, context) => {
          const { myCustomProperty } = context;

          return `context.myCustomProperty is «${myCustomProperty}»`;
        }
      }
    })
  })
});
```

Now you can make request:

```graphql
query {
  getPropFromContext
}
```

Output will be:

```json
{
  "data": {
    "getPropFromContext": "context.myCustomProperty is «myCustomValue»"
  }
}
```

[![Edit @via-profit-services-core-node-middleware](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/via-profit-services-core-node-middleware-9g3we?fontsize=14&hidenavigation=1&theme=dark)




**Warning! Do not use spread operator while combining old current context and new context value. See example below:**

_Warning! This code is not valid_

```js
// !!! This code is not valid
const { graphQLExpress } = await factory({
  server,
  schema,
  middleware: [
    (props) => {
      const { context } = props;

      return {
        ...context,
        myCustomProperty: 'myCustomValue',
      };
    }
  ]
});
// !!! This code is not valid
```

## requestCounter property

What might you need a counter for?. `requestCounter` - is simply a counter that indicates the number of requests that have arrived at your server. You can use it for logging or for example to subscribe `EventEmitter` listeners:

```js
const { graphQLExpress } = await core.factory({
  server,
  schema,
  middleware: [
    ({ context, requestCounter }) => {
      if (requestCounter === 1) {
        context.emitter.on("graphql-error", msg => console.error(msg));
      }

      return { context };
    },
    knexMiddleware
  ]
});
```

In this example, we are subscribing to the `graphql-error` listener. It is very important to do this once, otherwise, we will subscribe to messages every time a new http request is received.

## Typescript

### Expand the Сontext type

To expand the Сontext type you can expand the types using the Declaration files `*.d.ts`.
Now you can use TypeScript autocompletion in the IDE, which will contain the current Core types with your custom types.

_index.d.ts_

```ts
import "@via-profit-services/core";

declare module "@via-profit-services/core" {
  // extend standard Context object
  interface Context {
    myCustomProperty: string;
  }
}
```

_index.ts_

```ts
/// <reference path="./index.d.ts" />

// Other code lines
```

[![Edit via-profit-services-core-typescript-middleware](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/via-profit-services-core-typescript-middleware-bz1nr?fontsize=14&hidenavigation=1&theme=dark)



### Create middleware

_middleware.ts_

```ts
import { Middleware } from '@via-profit-services/core';

const myMiddleware: Middleware = ({ context }) => {

  // some code
  
  return {
    context,
  }
}

export default myMiddleware;
```
