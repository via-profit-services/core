import { IObjectTypeResolver } from 'graphql-tools';

import { IContext } from '../../../types';

const infoQueryResolver: IObjectTypeResolver<any, IContext> = {
  developer: () => ({}),
};

export default infoQueryResolver;
