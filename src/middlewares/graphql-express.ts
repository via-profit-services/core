import type { GraphQLExpressFactory, GraphQLExpress } from '@via-profit-services/core';

import factory from '../application';

const graphqlExpressFactory: GraphQLExpressFactory = async props => {
  const httpListener = await factory(props);
  const expressListener: GraphQLExpress = async (req, res) => {
    await httpListener(req, res);
  };

  return expressListener;
};

export default graphqlExpressFactory;
