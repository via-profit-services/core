import type { IObjectTypeResolver } from '@graphql-tools/utils';
import type { Context } from '@via-profit-services/core';

import { DEV_INFO_DEVELOPER_EMAIL, DEV_INFO_DEVELOPER_NAME, DEV_INFO_DEVELOPER_URL } from '../constants';

const Developer: IObjectTypeResolver<any, Context> = {
  name: () => DEV_INFO_DEVELOPER_NAME,
  url: () => DEV_INFO_DEVELOPER_URL,
  email: () => DEV_INFO_DEVELOPER_EMAIL,
};

export default Developer;
