# Контекст

`context` — третий аргумент каждого резолвера. В нём лежит то, что относится к **текущему запросу**: авторизованный пользователь, локаль, загрузчики данных (DataLoader), ссылки на сервисы.

```ts
resolve: (parent, args, context, info) => { /* ... */ }
```

## Жизненный цикл

1. На каждый HTTP-запрос ядро создаёт **новый пустой объект** `{}`.
2. [Middleware](./middlewares.md) по очереди записывают в него данные.
3. Все резолверы этого запроса получают один и тот же объект.
4. После ответа объект больше не используется.

Запросы обрабатываются одновременно: каждый `await` (запрос к БД, чтение тела) отдаёт управление другим запросам. Поэтому у каждого запроса свой контекст, иначе данные разных пользователей перемешаются.

## Наполнение контекста

```ts
import type { Middleware } from '@via-profit-services/core';

// Долгоживущие объекты создаются ОДИН раз при старте
const knex = createKnex(config.db);

const contextMiddleware: Middleware = async ({ context, request }) => {
  context.knex = knex;                                      // ссылка на общий пул: дёшево
  context.user = await authenticate(request.headers.authorization);  // данные запроса
  context.loaders = createLoaders(knex);                   // DataLoader — на каждый запрос
};

const graphqlHTTP = graphqlHTTPFactory({ schema, middleware: [contextMiddleware] });
```

> ⚠️ Не создавайте долгоживущие ресурсы в middleware по условию вида
> `if (!context.knex) context.knex = createKnex()`. Контекст новый на каждый запрос,
> поэтому пул соединений будет создаваться заново каждый раз.

## Типизация

`Context` — пустой интерфейс. Расширьте его в своём проекте через declaration merging:

```ts
// src/@types/context.d.ts
import '@via-profit-services/core';
import type { Knex } from 'knex';

declare module '@via-profit-services/core' {
  interface Context {
    knex: Knex;
    user: { id: string; roles: string[] } | null;
  }
}
```

После этого `context` в middleware и резолверах будет типизирован.

> ⚠️ Файл с `declare module` должен быть модулем: в нём нужен хотя бы один `import` или `export`
> (например, `import '@via-profit-services/core';` как выше или `export {};`). Без них TypeScript
> считает `declare module '@via-profit-services/core'` самостоятельным описанием пакета, и оно
> заменяет типы ядра вместо того, чтобы дополнить их: импорты вида `graphqlHTTPFactory` или
> `PageInfoType` перестают находиться («has no exported member»). До версии 3.0 типы ядра сами
> были написаны через `declare module`, и такой файл работал — при переходе на 3.x его нужно поправить.

## Общий контекст (`sharedContext`)

До версии 2.12 контекст создавался один раз и был общим для **всех** запросов. Это приводило к утечке данных между пользователями. Старое поведение оставлено только для обратной совместимости:

```ts
graphqlHTTPFactory({ schema, sharedContext: true }); // устарело, не используйте в новом коде
```

Включать его имеет смысл, только если в проекте ещё есть код, который рассчитывает, что объект в контексте «переживёт» запрос. Правильная миграция — создавать такие объекты при старте приложения (см. пример выше). Подробнее — в [руководстве по миграции](./migration-2.12.md).
