import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../types';

const infoQueryResolver: IResolverObject<any, IContext> = {
  developer: () => ({}),
};

export default infoQueryResolver;
