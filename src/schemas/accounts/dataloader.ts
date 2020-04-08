import { IContext } from '../../app';
import { Authentificator, IAccount } from '../../authentificator';
import { Node, DataLoader } from '../../utils';


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

  const authentificator = new Authentificator({ context });

  loaders.accounts = new DataLoader<
    string, Node<IAccount>
  >((ids: string[]) => authentificator.getAccountsByIds(ids));
  return loaders;
}
