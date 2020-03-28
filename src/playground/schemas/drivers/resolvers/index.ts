import { IResolvers } from 'graphql-tools';
import { IContext } from '../../../../app';
import { DriversQuery } from './queries';

const resolvers: IResolvers<any, IContext> = {
  Query: {
    drivers: () => ({}),
  },
  DriversQuery,
};

export default resolvers;
