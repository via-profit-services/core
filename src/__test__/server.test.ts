import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import configTest from './config-test';

const schema = new GraphQLSchema({
  description: 'Testing only',
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      getFourAsString: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: () => 'four',
      },
      getFourAsNumber: {
        type: new GraphQLNonNull(GraphQLInt),
        resolve: () => 4,
      },
    },
  }),
});

const { startServer, stopServer, graphqlRequest } = configTest({ schema });

beforeAll(async () => {
  await startServer();
});

afterAll(async () => {
  await stopServer();
});

describe('Graphql server', () => {
  test('test', done => {
    const expectedData = {
      getFourAsString: 'four',
      getFourAsNumber: 4,
    };
    graphqlRequest<typeof expectedData>({
      query: 'query {getFourAsString, getFourAsNumber}',
    }).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
        }),
      );
      expect(response.data).toBeInstanceOf(Object);
      expect(response.data).toEqual(expect.objectContaining(expectedData));
      done();
    });
  });
});
