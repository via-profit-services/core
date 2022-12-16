## Event emitter

The core event emitter is contained in the `Context` object. This is a simple [Node Emitter class](https://nodejs.org/api/events.html#class-eventemitter). By default, Core emitter implements the following events:

 - `graphql-error` - Called when a Graphql runtime error occurs.

Various middleware can add their own events, for example, middleware [Knex](https://github.com/via-profit-services/knex) adds such events as: `knex-error`; `knex-warning`; `knex-debug`.

To add your own events go to the [middlewares](./middlewares.md)

## Core Event emitter example

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

Be careful. In this example, we use **requestCounter** property, with which we subscribe to the `graphql-error` event only once. If we do not take this into account, then with each new request to the server, we will subscribe to the event again and again.
