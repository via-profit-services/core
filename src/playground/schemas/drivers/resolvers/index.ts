import { IResolvers } from 'graphql-tools';
import { IContext } from '../../../../app';
import { ServerError } from '../../../../errorHandlers';
import {
  buildCursorConnection,
  buildQueryFilter,
  TInputFilter,
  Node,
  dataloaderManager,
} from '../../../../utils';
import DriverService, { IDriverUpdateInfo, IDriver } from '../driversService';
import createDataloader from '../loaders';


const resolvers: IResolvers<any, IContext> = {
  Query: {
    drivers: () => ({}),
  },
  Mutation: {
    drivers: () => ({}),
  },
  Driver: dataloaderManager.resolveObject<string, IDriver>(['name', 'status'], createDataloader),

  DriversQuery: {
    list: async (parent, args: TInputFilter, context) => {
      const filter = buildQueryFilter(args);
      const driverService = new DriverService({ context });
      const loader = dataloaderManager.createOrGetDataloader<string, Node<IDriver>>(context, 'drivers', createDataloader);

      try {
        const driversConnection = await driverService.getDrivers(filter);

        // fill the cache
        driversConnection.nodes.forEach((node) => {
          loader.clear(node.id).prime(node.id, node);
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

      const loader = dataloaderManager.createOrGetDataloader<string, Node<IDriver>>(context, 'drivers', createDataloader);
      const driverService = new DriverService({ context });

      try {
        await driverService.updateDriver(id, otherData.data);
      } catch (err) {
        throw new ServerError('Failed to update driver');
      }

      loader.clear(id);
      return { id };
    },
  },
};

export default resolvers;
