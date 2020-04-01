import { IResolvers } from 'graphql-tools';
import { IContext } from '../../../../app';
import { ServerError } from '../../../../errorHandlers';
import {
  buildCursorConnection,
  buildQueryFilter,
  TInputFilter,
  DataLoader,
} from '../../../../utils';
import DriverService, {
  IDriverUpdateInfo, IDriver, DriverStatus, DriverLegalStatus,
} from '../driversService';
import createDataloader from '../loaders';

const dataloaders: {list: DataLoader<string, IDriver>} = {
  list: null,
};


const resolvers: IResolvers<any, IContext> = {
  Query: {
    drivers: () => ({}),
  },
  Mutation: {
    drivers: () => ({}),
  },
  Driver: {
    createdAt: async ({ id }: Pick<IDriver, 'id'>, args, context) => {
      dataloaders.list = dataloaders.list || createDataloader(context);
      const data = await dataloaders.list.load(id);
      return data.createdAt;
    },
    updatedAt: async ({ id }: Pick<IDriver, 'id'>, args, context) => {
      dataloaders.list = dataloaders.list || createDataloader(context);
      const data = await dataloaders.list.load(id);
      return data.updatedAt;
    },
    status: async ({ id }: Pick<IDriver, 'id'>, args, context) => {
      dataloaders.list = dataloaders.list || createDataloader(context);
      const data = await dataloaders.list.load(id);
      return data.status;
    },
    legalStatus: async ({ id }: Pick<IDriver, 'id'>, args, context) => {
      dataloaders.list = dataloaders.list || createDataloader(context);
      const data = await dataloaders.list.load(id);
      return data.legalStatus;
    },
    name: async ({ id }: Pick<IDriver, 'id'>, args, context) => {
      dataloaders.list = dataloaders.list || createDataloader(context);
      const data = await dataloaders.list.load(id);
      return data.name;
    },
  },
  DriversQuery: {
    list: async (parent, args: TInputFilter, context) => {
      dataloaders.list = dataloaders.list || createDataloader(context);
      const filter = buildQueryFilter(args);
      const driverService = new DriverService({ context });

      try {
        const driversConnection = await driverService.getDrivers(filter);
        const connection = buildCursorConnection(driversConnection);

        // fill the cache
        driversConnection.nodes.forEach((node) => {
          dataloaders.list.clear(node.id).prime(node.id, node);
        });

        return connection;
      } catch (err) {
        throw new ServerError('Failed to get Drivers list', { err });
      }
    },
    statusesList: () => Object.values(DriverStatus),
    legalStatusesList: () => Object.values(DriverLegalStatus),
  },
  DriversMutation: {
    updateDriver: async (parent, args: { id: string; data: IDriverUpdateInfo }, context) => {
      const { id, ...otherData } = args;
      dataloaders.list = dataloaders.list || createDataloader(context);
      const driverService = new DriverService({ context });

      try {
        await driverService.updateDriver(id, otherData.data);
      } catch (err) {
        throw new ServerError('Failed to update driver');
      }

      // clear cache of this driver
      dataloaders.list.clear(id);
      return { id };
    },
  },
};

export default resolvers;
