# Error handlers (исключения)

> Via Profit services / **Core**

Исключения ([exception](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Error)) позволяют регистрировать наличие ошибки и прерывать дальнейшее выполнение скрипта.

Доступные хэндлеры:

- **BadRequestError**. Код состояния ответа **400 Bad Request**.
- **UnauthorizedError**. Код состояния ответа **401 Unauthorized**.
- **ForbiddenError**. Код состояния ответа **403 Forbidden**.
- **NotFoundError**. Код состояния ответа **404 Not Found**.
- **ServerError**. Код состояния ответа **500 Internal Server Error**.

Пример регистрации ошибки:

```ts
import { BadRequestError } from '@via-profit-services/core';

throw new BadRequestError('Some Error');
```


