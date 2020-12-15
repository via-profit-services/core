import { IResolvers } from '@graphql-tools/utils';

import Developer from './Developer';
import InfoMutation from './InfoMutation';
import InfoQuery from './InfoQuery';
import Mutation from './Mutation';
import Query from './Query';
import scalars from './scalars';

const resolvers: IResolvers = {
  Query,
  Mutation,
  InfoQuery,
  InfoMutation,
  Developer,
  ...scalars,
};

export default resolvers;
