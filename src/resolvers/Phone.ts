import { IObjectTypeResolver, IFieldResolver } from '@graphql-tools/utils';
import { Context, Phone } from '@via-profit-services/core';

const PhoneResolver = new Proxy<IObjectTypeResolver<Phone, Context>>({
  number: () => ({}),
  country: () => ({}),
  description: () => ({}),
  metaData: () => ({}),
}, {
  get: (_target, prop: keyof Phone) => {
    const resolver: IFieldResolver<Phone, Context> = (parent) => {

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
