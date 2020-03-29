import { IResolvers } from 'graphql-tools';
import { IContext } from '../../../../app';
import { ServerError } from '../../../../errorHandlers';
import { buildCursorConnection, buildQueryFilter, TInputFilter } from '../../../../utils';
import DriverService, { IDriverUpdateInfo } from '../driversService';

const resolvers: IResolvers<any, IContext> = {
  Query: {
    drivers: () => ({ }),
  },
  Mutation: { drivers: () => ({}) },
  DriversQuery: {
    list: async (parent, args: TInputFilter, context) => {
      const filter = buildQueryFilter(args);
      const driverService = new DriverService({ context });

      try {
        const driversConnection = await driverService.getDrivers(filter);
        const connection = buildCursorConnection(driversConnection);

        return connection;
      } catch (err) {
        throw new ServerError('Failed to get Drivers list', { err });
      }
    },
  },
  DriversMutation: {
    updateDriver: async (parent, args: {id: string; data: IDriverUpdateInfo}, context) => {
      const { id, ...otherData } = args;

      const driverService = new DriverService({ context });

      try {
        await driverService.updateDriver(id, otherData.data);
      } catch (err) {
        throw new ServerError('Failed to update driver');
      }

      return { id };
    },
  },
  DriversMutationPayload: {
    driver: async (parent: {id: string}, args, context) => {
      const driverService = new DriverService({ context });
      const { id } = parent;

      try {
        const driver = await driverService.getDriver(id);
        if (!driver) {
          throw new ServerError(`Driver with id [${id}] not found`, { id });
        }
        return driver;
      } catch (err) {
        throw new ServerError(`Failed to get driver with id [${id}]`, { err });
      }
    },
  },
};

export default resolvers;
