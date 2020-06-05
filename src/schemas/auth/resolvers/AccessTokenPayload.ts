import { IResolverObject, IFieldResolver } from 'graphql-tools';

import { IContext } from '../../../types';
import { IAccessToken } from '../service';

type IParent = IAccessToken['payload'];
type TAccountResolver = IResolverObject<IParent, IContext>;


const accessTokenPayloadResolver = new Proxy<TAccountResolver>({
  id: () => ({}),
  type: () => ({}),
  uuid: () => ({}),
  roles: () => ({}),
  exp: () => ({}),
  iss: () => ({}),
}, {
  get: (target, prop: keyof IAccessToken['payload']) => {
    const resolver: IFieldResolver<IParent, IContext> = async (parent, args, context) => {
      const token = (parent.id && parent.id !== '') ? parent : context.token;
      console.log('Access token resolver');
      console.log('parent', parent);
      console.log('context.token', context.token);
      return token[prop];
    };
    return resolver;
  },
});

export default accessTokenPayloadResolver;
