import InfoMutation from './InfoMutation';
import InfoQuery from './InfoQuery';
import Mutation from './Mutation';
import Query from './Query';
import scalars from './scalars';
import Subscription from './Subscription';

const resolvers = {
  Query,
  Mutation,
  Subscription,
  InfoQuery,
  InfoMutation,
  ...scalars,
};

export default resolvers;
