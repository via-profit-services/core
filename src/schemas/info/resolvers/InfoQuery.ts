import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';

const infoQueryResolver: IResolverObject<any, IContext> = {
  developer: () => ({}),
};

export default infoQueryResolver;
