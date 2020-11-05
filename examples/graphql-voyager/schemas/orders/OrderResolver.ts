import { IContext, IObjectTypeResolver, IFieldResolver } from '@via-profit-services/core';

import orders from './orders';
import { IOrder } from './types';

interface TSource {
  id: string;
}

type TOrderResolver = IObjectTypeResolver<TSource, IContext>;

const OrderResolver = new Proxy<TOrderResolver>({
  id: () => ({}),
  number: () => ({}),
}, {
  get: (target, prop: keyof IOrder) => {
    const resolver: IFieldResolver<any, IContext> = async (parent) => {
      const { id } = parent;
      const order = orders.find((o) => o.id === id);

      console.log(`get order property ${prop}`);

      return order[prop];
    };

    return resolver;
  },
});

export default OrderResolver;
