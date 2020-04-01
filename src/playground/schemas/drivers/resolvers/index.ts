import { IResolvers } from 'graphql-tools';
import { IContext } from '../../../../app';
import { ServerError } from '../../../../errorHandlers';
import {
  buildCursorConnection,
  buildQueryFilter,
  TInputFilter,
  Node,
  DataLoader,
  resolveByDataLoader,
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
    drivers: (parent, args, context) => {
      dataloaders.drivers = createDataloader(context).drivers;
      return {};
    },
  },
  Mutation: {
    drivers: (parent, args, context) => {
      dataloaders.drivers = createDataloader(context).drivers;
      return {};
    },
  },
  Driver: {
    name: async ({ id }: Pick<IDriver, 'id'>) => {
      const value = await resolveByDataLoader<string, Node<IDriver>>(id, 'name', dataloaders.drivers);
      return value;
    },
    status: async ({ id }: Pick<IDriver, 'id'>) => {
      const value = await resolveByDataLoader<string, Node<IDriver>>(id, 'status', dataloaders.drivers);
      return value;
    },
  },

  DriversQuery: {
    list: async (parent, args: TInputFilter, context) => {
      const filter = buildQueryFilter(args);
      const driverService = new DriverService({ context });

      try {
        const driversConnection = await driverService.getDrivers(filter);

        // fill the cache
        driversConnection.nodes.forEach((node) => {
          dataloaders.drivers.clear(node.id).prime(node.id, node);
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
