import type { IObjectTypeResolver } from '@graphql-tools/utils';
import type { Phone } from '@via-profit-services/core';

import {
  DEV_INFO_DEVELOPER_EMAIL, DEV_INFO_DEVELOPER_NAME,
  DEV_INFO_DEVELOPER_URL, DEV_INFO_DEVELOPER_PHONE,
} from '../constants';

interface Developer {
  name: string;
  url: string;
  email: string;
  phone: Phone;
}


const developer: Developer = {
  name: DEV_INFO_DEVELOPER_NAME,
  url: DEV_INFO_DEVELOPER_URL,
  email: DEV_INFO_DEVELOPER_EMAIL,
  phone: DEV_INFO_DEVELOPER_PHONE,
}


const DeveloperResolver = new Proxy<IObjectTypeResolver<Developer>>({
  name: () => ({}),
  url: () => ({}),
  email: () => ({}),
  phone: () => ({}),
}, {
  get: (target, prop: string) => () => developer[prop as keyof Developer],
});

export default DeveloperResolver;
