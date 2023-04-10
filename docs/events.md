## Event emitter

The core event emitter is contained in the `Context` object. This is a simple [Node Emitter class](https://nodejs.org/api/events.html#class-eventemitter). By default, Core emitter implements the following events:

 - `graphql-error-execute` - No info.
 - `graphql-error-validate-field` - No info.
 - `graphql-error-validate-request` - No info.
 - `graphql-error-validate-schema` - No info.


To add your own events go to the [middlewares](./middlewares.md)

## Core Event emitter example

```js
const { graphqlHTTP } = graphqlHTTPFactory({
  server,
  schema,
  middleware: [
    ({ context, requestCounter }) => {
      if (requestCounter === 1) {
        context.emitter.on("graphql-error-execute", msg => console.error(msg));
      }
    },
  ]
});
```

Be careful. In this example, we use **requestCounter** property, with which we subscribe to the `graphql-error-execute` event only once. If we do not take this into account, then with each new request to the server, we will subscribe to the event again and again.
