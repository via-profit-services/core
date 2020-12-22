# Via Profit Services / Core

![via-profit-services-cover](./assets/via-profit-services-cover.png)

> Via Profit services / **Core** - [GraphQL](https://graphql.org/) server based on [Express](http://expressjs.com) framework

![npm (scoped)](https://img.shields.io/npm/v/@via-profit-services/core?color=blue)
![NPM](https://img.shields.io/npm/l/@via-profit-services/core?color=blue)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@via-profit-services/core?color=green)

## Peer dependencies

 - [Express](https://github.com/expressjs/express) - Node HTTP Server
 - [DataLoader](https://github.com/graphql/dataloader) - GraphQL DataLoader
 - [Moment](https://github.com/moment/moment) - Date library
 - [Moment Timezone](https://github.com/moment/moment-timezone) - Time zone support for Moment
 - [Winston](https://github.com/winstonjs/winston) - Logger
 - [Winston Daily Rotate File](https://github.com/winstonjs/winston-daily-rotate-file) - A transport for winston which logs to a rotating file

## Installation

At first you need to install the peer dependencies:

```bash
$ yarn add express graphql dataloader moment moment-timezone winston winston-daily-rotate-file
```

Then install the core

```bash
$ yarn add @via-profit-services/core
```

## Getting Started

To get started, make your GraphQL schema, create http server and apply middleware.

_Node: You can see this example in [examples/simple](./examples/simple/README.md)_

```js
const express = require('express');
const http = require('http');
const Core = require('@via-profit-services/core');

const schema = require('./schema');
const port = 9005;

(async () => {

  const app = express();
  const server = http.createServer(app);

  const { graphQLExpress } = await Core.factory({
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

## Typescript

The module already has full typescript support


## License
The  [MIT](./LICENSE) License.

