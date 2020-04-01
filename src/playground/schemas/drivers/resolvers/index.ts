import { IResolvers } from 'graphql-tools';
import { IContext } from '../../../../app';
import { ServerError } from '../../../../errorHandlers';
import {
  buildCursorConnection,
  buildQueryFilter,
  TInputFilter,
  Node,
  DataLoader,
  dataloaderManager,
} from '../../../../utils';
import DriverService, { IDriverUpdateInfo, IDriver } from '../driversService';
import createDataloader from '../loaders';


interface DataloadersPool {
  drivers: DataLoader<string, Node<IDriver>>;
}

const dataloaders: DataloadersPool = {
  drivers: null,
};

const resolvers: IResolvers<any, IContext> = {
  Query: {
    drivers: () => ({}),
  },
  Mutation: {
    drivers: () => ({}),
  },
  Driver: {
    name: async ({ id }: Pick<IDriver, 'id'>) => {
      const value = await dataloaderManager.resolveByDataLoader<string, Node<IDriver>>(id, 'name', dataloaderManager.get('driversList'));
      return value;
    },
    status: async ({ id }: Pick<IDriver, 'id'>) => {
      const value = await dataloaderManager.resolveByDataLoader<string, Node<IDriver>>(id, 'status', dataloaderManager.get('driversList'));
      return value;
    },
  },

  DriversQuery: {
    list: async (parent, args: TInputFilter, context) => {
      const filter = buildQueryFilter(args);
      const driverService = new DriverService({ context });

      try {
        const driversConnection = await driverService.getDrivers(filter);

        // create dataloader
        dataloaderManager.set('driversList', createDataloader(context).drivers);

        // fill the cache
        driversConnection.nodes.forEach((node) => {
          dataloaderManager.get('driversList').clear(node.id).prime(node.id, node);
        });

        const connection = buildCursorConnection(driversConnection);

        return connection;
      } catch (err) {
        throw new ServerError('Failed to get Drivers list', { err });
      }
    },
    test: async (parent, args, context) => {
      console.log('test');
      const driverService = new DriverService({ context });
      const driversConnection = await driverService.getDrivers({
        offset: 0,
        limit: 10,
      });

      console.log('driversConnection', driversConnection);
      return '';
    },
  },
  DriversMutation: {
    updateDriver: async (parent, args: { id: string; data: IDriverUpdateInfo }, context) => {
      const { id, ...otherData } = args;

      const driverService = new DriverService({ context });

      try {
        await driverService.updateDriver(id, otherData.data);
      } catch (err) {
        throw new ServerError('Failed to update driver');
      }

      dataloaders.drivers.clear(id);
      return { id };
    },
  },
};

export default resolvers;
