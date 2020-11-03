# Context

> Via Profit services / **Core**

Объект контекст передается в соответствии со спецификацией GraphQL и доступен из всех резолверов.

Контекст опиывается интерфейсом `<IContext>`:

```ts
interface IContext {
  endpoint: string; // GraphQL endpoint
  jwt: IJwtConfig; // Параметры JSON web token
  knex: KnexInstance; // Инстанс Knex
  logger: ILoggerCollection; // Объект логгеров
  pubsub: RedisPubSub (https://github.com/davidyaha/graphql-redis-subscriptions)
  redis: Redis (https://github.com/luin/ioredis/)
  timezone: string; // Текущая временная зона
  token: IAccessToken['payload']; // Access Token payload
  deviceInfo: DeviceDetector.DeviceDetectorResult; // Объект с распарсенными данными User-Agent
}
```

_Примечание:_ Содержимое `deviceInfo` [см. здесь](https://www.npmjs.com/package/device-detector-js)
