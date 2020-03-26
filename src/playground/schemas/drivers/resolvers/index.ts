import { IResolvers } from 'graphql-tools';
import { IContext } from '../../../../app';
import { DriversQueries } from './queries';

const resolvers: IResolvers<any, IContext> = {
  Query: {
    drivers: () => ({}),
  },
  DriversQueries,
};

export default resolvers;
