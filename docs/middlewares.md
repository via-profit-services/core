## Middlewares

## Table of contents

- [Overview](#overview)
- [Example](#example)
- [Typescript](#typescript)
- [RequestCounter property](#requestcounter-property)

## Overview

Middleware is a special function that allows you to expand the GraphQL [Context](./context.md) by adding new parameters into it, as well as performing GraphQL validation at the [ValidationRule](https://graphql.org/graphql-js/validation/). In addition, you can modify the current GraphQL scheme.

Middleware factory function will be called on **every GraphQL request**. Keep it in mind. When calling function, it would passed a set of parameters which contains a current context value, current schema, http request and so on.

_Note: Middlewares order. Since each middleware mutates the context and returns it back. The presence of a property parameter in the context will depend on each of these middleware._

Will be passed:

- **config** - Parameters that were passed during core factory called.
- **context** - The current context value returned from the previous middleware, or the default context value if no middleware has been executed before.
- **schema** - The current GraphQL schema returned from the previous middleware, or the initial schema if no middleware has been executed before.
- **extensions** - The current Extensions object returned from the previous middleware, or the initial extensions if no middleware has been executed before.
- **request** - HTTP request (`Express.Request`)
- **validationRule** - [Graphql validationRule](https://graphql.org/graphql-js/validation/)
- **stats**
  - **requestCounter** - HTTP request counter
  - **startupTime** A date of application startup

## Example

To create your simple middleware you can see this example:

_index.js_

```js
const graphqlHTTP = graphqlHTTPFactory({
  schema,
  middleware: [
    props => {
      const { context } = props;
      context.myCustomProperty = 'myCustomValue';
    },
  ],
});
```

_schema.js_

```js
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      getPropFromContext: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (parent, args, context) => {
          const { myCustomProperty } = context;

          return `context.myCustomProperty is «${myCustomProperty}»`;
        },
      },
    }),
  }),
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
## requestCounter property

What might you need a counter for?. `requestCounter` - is simply a counter that indicates the number of requests that have arrived at your server. You can use it for logging or for example to subscribe `EventEmitter` listeners:

```js
const { graphqlHTTPFactory } = require('@via-profit-services/core');

const graphqlHTTP = graphqlHTTPFactory({
  schema,
  middleware: [
    ({ context, stats }) => {
      if (state.requestCounter === 1) {
        context.emitter.on('graphql-error-execute', msg => console.error(msg));
      }
    },
  ],
});
```

In this example, we are subscribing to the `graphql-error-execute` listener. It is very important to do this once, otherwise, we will subscribe to messages every time a new http request is received.

## Typescript

### Expand the Сontext type

To expand the Сontext type you can expand the types using the Declaration files `*.d.ts`.
Now you can use TypeScript autocompletion in the IDE, which will contain the current Core types with your custom types.

_index.d.ts_

```ts
import '@via-profit-services/core';

declare module '@via-profit-services/core' {
  // extend standard Context object
  interface Context {
    myCustomProperty: string;
  }
}
```

### Create middleware

_middleware.ts_

```ts
import { Middleware } from '@via-profit-services/core';

const myMiddleware: Middleware = ({ context }) => {
  // some code
};

export default myMiddleware;
```
