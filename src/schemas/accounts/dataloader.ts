import { IContext } from '../../app';
import { Authentificator, IAccount } from '../../authentificator';
import { TWhereAction, Node, DataLoader } from '../../utils';


export default function createDataloader(context: IContext) {
  const authentificator = new Authentificator({ context });

  const batchDrivers = async (ids: readonly string[]) => {
    const { nodes } = await authentificator.getAccounts({
      limit: ids.length,
      offset: 0,
      where: [['id', TWhereAction.IN, ids]],
    });

    return ids.map((id) => nodes.find((n) => n.id === id));
  };

  return new DataLoader<string, Node<IAccount>>((ids) => batchDrivers(ids));
}
