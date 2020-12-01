import { Context, IObjectTypeResolver } from '@via-profit-services/core';

import orders from './orders';

const OrdersQuery: IObjectTypeResolver<any, Context> = {
  order: (_, args: {id: string}) => {
    const { id } = args;
    const order = orders.find((o) => o.id === id) || null;

    return order;
  },
  list: () => {
    console.log('get orders list');

    return orders;
  },
};

export default OrdersQuery;
