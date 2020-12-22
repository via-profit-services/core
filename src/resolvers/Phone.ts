import { Context, Phone } from '@via-profit-services/core';
import type { GraphQLFieldResolver } from 'graphql';

const PhoneResolver = new Proxy({
  number: () => ({}),
  country: () => ({}),
  description: () => ({}),
  metaData: () => ({}),
}, {
  get: (_target, prop: keyof Phone) => {
    const resolver: GraphQLFieldResolver<Phone, Context> = (parent) => {

      const phone: Phone = {
        country: 'RU',
        number: '7',
        description: '',
        ...parent,
      }

      return phone[prop];
    }

    return resolver;
  },
});

export default PhoneResolver;
