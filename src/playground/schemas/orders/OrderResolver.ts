import { IObjectTypeResolver, IFieldResolver } from 'graphql-tools';

import { IContext } from '../../../types';
import orders from './orders';
import { IOrder } from './types';

type TOrderResolver = IObjectTypeResolver<{id: string}, IContext>;


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
