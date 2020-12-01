# Express Middleware

> Via Profit services / **Core**


Для подключения `middleware` необходимо создать функцию, на вход которой будет передан объект с контекстом (`Context`). Функция должна возвращать [Express middleware](https://expressjs.com/ru/guide/using-middleware.html).

Пример подключения `middleware`:

```ts
import { Router } from 'express';
import { IExpressMidlewareContainer, App } from '@via-profit-services/core';

// Simple middleware logger
const loggerMiddleware: IExpressMidlewareContainer = ({ context }) => {
  return (res, req, next) => {
    const { logger } = context;
    logger.server.debug('Some message');

    next();
  }
}

// Router middlwware
const routerMiddleware: IExpressMidlewareContainer = () => {
  const router = Router();
  router.use('/custom-url-path', (req, res, next) => {
    res.json({ response: 'ok' });
  });
  return router;
}

const app = new App({
  ...
  expressMiddlewares: [ customMiddleware, routerMiddleware ],
});
```