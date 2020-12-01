# API

> Via Profit services / **Core**

## Содержание

- [App](#app)
- [CronJobManager](#cronjobmanager)
- [configurelogger](#configurelogger)
- [buildQueryFilter](#buildqueryfilter)
- [buildCursorConnection](#buildcursorconnection)
- [stringToCursor](#stringtocursor)
- [cursorToString](#cursortostring)
- [convertOrderByToKnex](#convertorderbytoknex)
- [convertJsonToKnex](#convertjsontoknex)
- [collateForDataloader](#collatefordataloader)
- [arrayOfIdsToArrayOfObjectIds](#arrayofidstoarrayofobjectids)
- [extractNodeIds](#extractnodeids)
- [extractNodeField](#extractnodefield)


## <a name="app"></a> App

_Основной класс приложения. Реализует инстанс приложения_

```ts
import { App } from '@via-profit-services/core';

const app = new App({
  ...
});

app.bootstrap();
```

## <a name="cronjobmanager"></a> CronJobManager

_Статический класс, являющийся оберткой над пакетом [Node-Cron](https://github.com/kelektiv/node-cron). [Подробнее о Cron](./cron.md)_

```ts
import { CronJobManager } from '@via-profit-services/core';

CronJobManager.addJob('MyJobName', {
  cronTime: '*/30 * * * * *', // Выполнение каждые 30 секунд
  onTick: () => console.log('Fiered'), // Функция, которая выполнится
  start: true, // Активировать задание
});
```

## <a name="configurelogger"></a> configureLogger

_Конфигурирует логгер. [Подробнее о логгере](./logger.md)_


```ts
import { App, configureLogger } from '@via-profit-services/core';

const app = new App({
  ...
  logger: configureLogger({
    logDir: './log',
  }),
  ...
});
```


## <a name="buildqueryfilter"></a> buildQueryFilter

_Преобразует входные данные от GraphQL_

Принимает объект входных фильтров согласно спецификации GraphQL и возвращает объект, готовый для передачи в любой сервис для выборки списка каких-либо данных, например:

```ts
import {
  Context,
  buildQueryFilter,
  IDirectionRange,
  TInputFilter,
  IObjectTypeResolver,
} from '@via-profit-services/core';

import MyService from './my-service';

export const MyQueries: IObjectTypeResolver<any, Context, TInputFilter> = {
  list: async (obj, args, context) => {
    // аргумент args = { first, last, after, before, orderBy }

    // Преобразование входных данных в фильтр для модели сервиса
    const queryFilter = buildQueryFilter(args);

    // Инициализация какого-либо сервиса
    const service = new MyService({ context });

    // Вызов метода сервиса, который принимает преобразованный фильтр
    // Метод сервиса должен возвращать объект типа <IListResponse>:
    /*
      interface IListResponse<T> {
        totalCount: number; // <-- общее количество элементов
        offset: number; // <-- Текущий сдвиг выборки (PostgreSQL offset)
        limit: number; // <-- Текущее ограничение выборки (PostgreSQL limit)
        nodes: Node<T>[]; // <-- массив объектов, содержащих ключ cursor типа number
        orderBy: TOrderBy; // <-- Текущее значение группировки выборки (PostgreSQL group by)
        where: TWhere; // <-- Текущее значение ограничения выборки (PostgreSQL where)
      }
    */

    const myConnection = await service.getListOfMyData(queryFilter);

    // Преобразовываем полученные данные в GraphQL Cursor Connections (см. след пример)
    return buildCursorConnection(myConnection, 'cursorName');
  },
};
```

## <a name="buildcursorconnection"></a> `buildCursorConnection`

_Формирует [GraphQL Cursor Connections](https://facebook.github.io/relay/graphql/connections.htm)_

Принимает в качестве первого аргумента объект типа `<IListResponse>`, а в качестве второго - строку для именования курсора и возвращает объект типа `<ICursorConnectionProps>`, который соответствует возвращаемому значению [GraphQL Cursor Connections](https://facebook.github.io/relay/graphql/connections.htm) (см. предыдущий пример):

## <a name="stringtocursor"></a> `stringToCursor`

_Преобразует строку в курсор_

Принимает в качестве единственного аргумента строку и возвращает `base64` закодированную строку. Применяется для кодирования курсоров.

## <a name="cursortostring"></a> `cursorToString`

_Преобразует курсор в строку_

Принимает в качестве единственного аргумента `base64` строку, и возвращает ее декодированное значение. Применяется для декодирования курсоров.

## <a name="convertorderbytoknex"></a> `convertOrderByToKnex`

_Конвертирует массив типа `<TOrderBy>` в массив `<TOrderByKnex>`_

Принимает в качестве единственного аргумента массив формата `Array<{field: string; direction: IDirectionRange;}>` и преобразует его в массив формата `Array<{column: string; order: IDirectionRange;}>`:

```ts
knex('table')
  .select('*')
  .orderBy(convertOrderByToKnex(orderBy));
```

## <a name="convertjsontoknex"></a> `convertJsonToKnex`

_Конвертирует переданный массив или объект в `Knex.Raw()` запрос подставляя модификатор `::jsonb`_

Принимает в качестве первого аргумента инстанс knex, в качестве второго - массив или объект. Возвращает `Knex.Raw<TRecord>`
Данный метод используется для подстановки SQL выражения, например, в блок `insert`:

```ts
knex('table').insert({
  name: 'Anny',
  jsonbData: convertJsonToKnex(knex, [{ foo: 'bar' }]),
});
```

## <a name="collatefordataloader"></a> `collateForDataloader`

_Преобразует выборку для даталоадера для случаев, когда извлекаемое значение отсутствует, но было запрошено даталоадером_

Принимает в качестве первого аргумента массив ID, а в качестве второго - результат выборки для лоадера и возвращает данные в соответствии с набором данных лоадера, либо `null`, если запрашиваемые данные не найдены.

Наличие трерьего аргумента определяет, что вместо `null`, если запрашиваемые данные не найдены, будет возвращен `undefined`

## <a name="arrayofidstoarrayofobjectids"></a> `arrayOfIdsToArrayOfObjectIds`

_Преобразует массив с ID в массив объектов, сеодержащих единственный ключ `id` с соответствующим значением_

Принимает в качестве единственного аргумента массив и возвращает массив объектов, либо `null`, если массив пустой

## <a name="extractnodeids"></a> `extractNodeIds`

_Извлекает из массива типа `<Node>` ID и возвращает в виде массива_

Принимает в качестве единственного аргумента массив элементов и возвращает массив их ID

## <a name="extractnodefield"></a> `extractNodeField`

_Извлекает из массива типа `<Node>` ключи и возвращает в виде массива_

Принимает в качестве первого аргумента массив элементов, а в качестве второго - ключ, массив которых необходимо возвратить