import { IContext } from '../../../app';
import { TWhereAction, Node, DataLoader } from '../../../utils';
import DriverService, { IDriver } from './driversService';

export default function createDataloader(context: IContext) {
  const driversService = new DriverService({ context });

  const batchDrivers = async (ids: readonly string[]) => {
    const { nodes } = await driversService.getDrivers({
      limit: ids.length,
      offset: 0,
      where: [['id', TWhereAction.IN, ids]],
    });

    return nodes;
  };

  return new DataLoader<string, Node<IDriver>>((ids) => batchDrivers(ids));
}
