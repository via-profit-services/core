# Dataloader

> Via Profit services / **Core**

В качестве Dataloader используется стандартный пакет [dataloader](https://github.com/graphql/dataloader) для GraphQL.

**Принцип работы даталоадеров:**

Каждая схема должна реализовывать свои даталоадеры, например:

_file dataloader.ts_

```ts
import { Context, DataLoader, Node, collateForDataloader } from '@via-profit-services/core';
import PersonService, { Person } from 'my-service';

// Интерфейс пула даталоадеров модуля
interface Loaders {
  persons: DataLoader<string, Node<Person>>;
}

// Пул даталоадеров модуля
const loaders: Loaders = {
  persons: null,
};

// Функция создания даталоадеров модуля
// Если лоадеры уже были созданы, то функция просто их вернет,
// либо создаст новый пул
export default function createLoaders(context: Context) {
  // Проверяем, создавался ли уже этот пул
  if (loaders.persons !== null) {
    return loaders;
  }

  // Инициализируем какой-либо сервис
  const service = new PersonService({ context });

  // Создаем сам даталоадер
  loaders.persons = new DataLoader<string, Node<Person>>(async (ids: string[]) => {
    // Загружаем данные из БД
    return (
      service
        .getPersonsByIds(ids)
        // Сортируем для даталоадера
        .then(nodes => collateForDataloader(ids, nodes))
    );
  });

  return loaders;
}
```

_file resolver.ts_

```ts
import { TInputFilter, Context, IObjectTypeResolver } from '@via-profit-services/core';

// Импортируем функцию создания пула даталоадеров
import createLoaders from './dataloader';

export const personsQueryResolver: IObjectTypeResolver<any, Context, TInputFilter> = {
  // Резолвер, который должен вернуть информацию из БД
  getPersonById: (parent, args, context) => {
    const { id } = args;

    // Получаем лоадеры
    const { persons } = createLoaders(context);

    // Загружаем данные
    persons.load(id);
  },
};
```
