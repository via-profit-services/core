import { IContext } from '../../app';
import { Authentificator, IAccount } from '../../authentificator';
import { ServerError } from '../../errorHandlers';
import { TWhereAction, Node, DataLoader } from '../../utils';


export default function createDataloader(context: IContext) {
  const authentificator = new Authentificator({ context });

  const batchAccounts = async (ids: readonly string[]) => {
    try {
      const { nodes } = await authentificator.getAccounts({
        limit: ids.length,
        offset: 0,
        where: [['id', TWhereAction.IN, ids]],
      });

      return ids.map((id) => nodes.find((n) => n.id === id));
    } catch (err) {
      throw new ServerError('Accounts Dataloader error. Failed to load accounts', { ids });
    }
  };

  return new DataLoader<string, Node<IAccount>>((ids) => batchAccounts(ids));
}
