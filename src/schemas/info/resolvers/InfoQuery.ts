import { IContext, IObjectTypeResolver } from '../../../types';

const infoQueryResolver: IObjectTypeResolver<any, IContext> = {
  developer: () => ({}),
};

export default infoQueryResolver;
