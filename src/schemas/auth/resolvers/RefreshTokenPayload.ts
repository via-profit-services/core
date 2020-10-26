import { IObjectTypeResolver, IFieldResolver } from 'graphql-tools';

import { IContext } from '../../../types';
import { IRefreshToken } from '../types';

type IParent = IRefreshToken['payload'] | null;
type TAccountResolver = IObjectTypeResolver<IParent, IContext>;


const refreshTokenPayloadResolver = new Proxy<TAccountResolver>({
  id: () => ({}),
  type: () => ({}),
  uuid: () => ({}),
  roles: () => ({}),
  exp: () => ({}),
  iss: () => ({}),
}, {
  get: (target, prop: keyof IRefreshToken['payload']) => {
    const resolver: IFieldResolver<IParent, IContext> = async (parent) => {
      return parent[prop];
    };
    return resolver;
  },
});

export default refreshTokenPayloadResolver;
