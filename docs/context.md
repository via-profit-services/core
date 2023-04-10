## Context

## Table of contents

- [Overview](#overview)
- [Core Event emitter](#core-event-emitter)
- [Services collection](#services-collection)
- [Extends Context](#extends-context)

## Overview

`Context` - A value which is provided to every resolver and holds important contextual information like the currently logged in user, or access to a database ([graphql.org][https://graphql.org/learn/execution/#root-fields-resolvers]).

According to the graphql spec, each resolver receives the following set of arguments:

 - parent (first argument) - Object that was returned in the previous resolver.
 - args (second argument) - The arguments provided to the field in the GraphQL query.
 - **context** (third argument) - A value which is provided to every resolver and holds important contextual information.
 - info (fourth argument) - A value which holds field-specific information relevant to the current query as well as the schema details. See [type GraphQLResolveInfo](https://graphql.org/graphql-js/type/#graphqlobjecttype) for more details.


The baseline state of the context contains:

 - `emitter` - [CoreEmitter](#core-event-emitter);
 - `services` - [ServicesCollection](#services-collection);
 - `request` - [HTTP incomming](https://nodejs.org/api/http.html#class-httpincomingmessage) request object;
 - `schema` - GraphQLSchema. (See [Graphql-js](https://graphql.org/graphql-js/type/#graphqlschema) for more details);


## Core Event emitter

The core event emitter is contained in the `Context` object. This is a simple [Node Emitter class](https://nodejs.org/api/events.html#class-eventemitter). By default, Core emitter implements the following events:

 - `graphql-error` - Called when a Graphql runtime error occurs.

To add your own events go to the [middlewares](./middlewares.md)

For more details go to [Core Events](./events.md)



## Services collection

The property services is used to store various services in context. So, for example, the `@via-profit-services/core` module places its service named `core` in services.

For TypeScript you can expand the types using the Declaration files `*.d.ts`.
Now you can use TypeScript autocompletion in the IDE, which will contain the current Core types with your custom types.

_index.d.ts_

```ts
import "@via-profit-services/core";

declare module "@via-profit-services/core" {
  // types definitions of your own service class
  class MyService {
    public constructor(records: Record<string, string>);
    public getKeys(): string[];
    public getValues(): string[];
  }

  // extend standard ServicesCollection
  interface ServicesCollection {
    myService: MyService;
  }
}
```

_index.ts_

```ts
/// <reference path="./index.d.ts" />

// Other code lines
```

[![Edit via-profit-services-core-typescript-extends-context](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/via-profit-services-core-typescript-extends-context-51i51?fontsize=14&hidenavigation=1&theme=dark)


## Extends Context

To extend the `Context` and add your properties to it, you should use middlelevars. You can find more information on how to do this and examples in the [middleware documentation](./middlewares.md).