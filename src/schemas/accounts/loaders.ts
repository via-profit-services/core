import { IContext } from '../../app';
import { Node, DataLoader } from '../../utils';
import AccountsService, { IAccount } from './service';

interface Loaders {
  accounts: DataLoader<string, Node<IAccount>>;
}

const loaders: Loaders = {
  accounts: null,
};

export default function createLoaders(context: IContext) {
  if (loaders.accounts !== null) {
    return loaders;
  }

  const service = new AccountsService({ context });

  loaders.accounts = new DataLoader<
    string, Node<IAccount>
    >((ids: string[]) => service.getAccountsByIds(ids));

  return loaders;
}
