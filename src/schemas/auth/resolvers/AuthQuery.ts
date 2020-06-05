import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../types';

const authQueryResolver: IResolverObject<any, IContext> = {
  token: () => ({}),
};

export default authQueryResolver;
