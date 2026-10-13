import { graphql, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

import { fieldsWrapper } from '../index';

const makeSchema = () =>
  new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        plain: { type: GraphQLString },
        method: { type: GraphQLString },
        resolved: { type: GraphQLString, resolve: () => 'resolved' },
      },
    }),
  });

const rootValue = { plain: 'plain', method: () => 'from method' };

describe('fieldsWrapper', () => {
  test('fields without a resolver keep the default graphql-js behavior', async () => {
    const schema = fieldsWrapper(makeSchema(), () => ({}));
    const res = await graphql({ schema, source: '{ plain method resolved }', rootValue });

    expect(res).toEqual({ data: { plain: 'plain', method: 'from method', resolved: 'resolved' } });
  });

  test('wrapWithoutResolvers: false skips only fields without a resolver', async () => {
    const wrapped: string[] = [];
    const schema = fieldsWrapper(
      makeSchema(),
      ({ info }) => {
        wrapped.push(info.fieldName);

        return {};
      },
      { wrapWithoutResolvers: false },
    );

    await graphql({ schema, source: '{ plain method resolved }', rootValue });
    expect(wrapped).toEqual(['resolved']);
  });

  test('the wrapper may replace arguments and the resolver, sync or async', async () => {
    const schema = fieldsWrapper(makeSchema(), async ({ info, resolve }) =>
      info.fieldName === 'resolved'
        ? { resolve: (...args: Parameters<typeof resolve>) => `wrapped ${resolve(...args)}` }
        : { source: { plain: 'replaced source', method: () => 'm' } },
    );

    const res = await graphql({ schema, source: '{ plain resolved }', rootValue });
    expect(res.data).toEqual({ plain: 'replaced source', resolved: 'wrapped resolved' });
  });

  test('a synchronous wrapper does not turn values into promises', () => {
    const schema = fieldsWrapper(makeSchema(), () => undefined as never);
    const field = schema.getQueryType()!.getFields().resolved;

    expect(field.resolve!({}, {}, {}, { fieldName: 'resolved' } as never)).toBe('resolved');
  });

  test('a second call wraps again (both wrappers run)', async () => {
    const calls: string[] = [];
    const schema = makeSchema();
    fieldsWrapper(schema, () => {
      calls.push('first');

      return {};
    });
    fieldsWrapper(schema, () => {
      calls.push('second');

      return {};
    });

    await graphql({ schema, source: '{ resolved }' });
    expect(calls).toEqual(['second', 'first']);
  });
});
