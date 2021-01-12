import type { PhoneResolver, Phone } from '@via-profit-services/core';

const phoneResolver = new Proxy<PhoneResolver>({
  number: () => ({}),
  country: () => ({}),
  description: () => ({}),
  primary: () => ({}),
  confirmed: () => ({}),
  metaData: () => ({}),
}, {
  get: (_target, prop: keyof PhoneResolver) => {
    const resolver: PhoneResolver[keyof PhoneResolver] = (parent) => {

      const phone: Phone = {
        country: 'RU',
        number: '7',
        description: '',
        primary: false,
        confirmed: false,
        ...parent,
      }

      return phone[prop];
    }

    return resolver;
  },
});

export default phoneResolver;
