import { IResolverObject, IFieldResolver } from 'graphql-tools';

import { IContext } from '../../../types';
import createDataloaders from '../loaders';
import { IAccount } from '../service';

interface IParent {
  id: string;
}
type TAccountResolver = IResolverObject<IParent, IContext>;

const accountResolver = new Proxy<TAccountResolver>({
  id: () => ({}),
  createdAt: () => ({}),
  updatedAt: () => ({}),
  status: () => ({}),
  name: () => ({}),
  login: () => ({}),
  password: () => ({}),
  roles: () => ({}),
}, {
  get: (target, prop: keyof IAccount) => {
    const resolver: IFieldResolver<IParent, IContext> = async (parent, args, context) => {
      const { id } = parent;
      console.log('get ID', id);
      const loaders = createDataloaders(context);
      const account = await loaders.accounts.load(id);
      console.log('loaded account', account);
      return account[prop];
    };
    return resolver;
  },
});

export default accountResolver;
