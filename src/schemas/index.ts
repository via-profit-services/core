import * as auth from './auth';
import commonTypeDefs from './common.graphql';
import * as info from './info';
import * as scalar from './scalar';

const common = {
  typeDefs: commonTypeDefs,
};
export {
  auth,
  info,
  common,
  scalar,
};
