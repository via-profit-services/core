import { IResolvers } from '@graphql-tools/utils';

import InfoMutation from './InfoMutation';
import InfoQuery from './InfoQuery';
import Mutation from './Mutation';
import Phone from './Phone';
import Query from './Query';
import scalars from './scalars';

const resolvers: IResolvers = {
  Query,
  Mutation,
  InfoQuery,
  InfoMutation,
  Phone,
  ...scalars,
};

export default resolvers;
