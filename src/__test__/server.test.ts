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
      getFiveWithError: {
        type: new GraphQLNonNull(GraphQLInt),
        resolve: () => null, // will be error
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
  // Check to response not contain errors field
  // Check to response contain data field
  // Check to response contain expected data
  test('Should return valid graphql response', done => {
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
      expect(typeof response.errors).toBe('undefined');
      expect(response.data).toEqual(expect.objectContaining(expectedData));
      done();
    });
  });
  // Deliberately false request
  // Check response contain errors
  test('Should return errors for non-nullable field Query.getFiveWithError', done => {
    const expectedData = [
      {
        message: 'Cannot return null for non-nullable field Query.getFiveWithError.',
        path: ['getFiveWithError'],
      },
    ];
    graphqlRequest<typeof expectedData>({
      query: 'query {getFiveWithError}',
    }).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
        }),
      );
      expect(typeof response.data).toBe('undefined');
      expect(response.errors).toBeInstanceOf(Object);
      expect(response.errors[0].path).toEqual(expectedData[0].path);
      expect(response.errors[0].message).toEqual(expectedData[0].message);
      done();
    });
  });

  test('Should return errors as cannot query field "nonDefined"', done => {
    const expectedData = [
      {
        message: 'Cannot query field "notDefined" on type "Query".',
      },
    ];
    graphqlRequest<typeof expectedData>({
      query: 'query {notDefined}',
    }).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
        }),
      );
      expect(typeof response.data).toBe('undefined');
      expect(response.errors).toBeInstanceOf(Object);
      expect(response.errors[0].message).toEqual(expectedData[0].message);
      done();
    });
  });
});
