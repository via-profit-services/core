import {
  nodeToEdge,
  stringToCursor,
  buildCursorConnection,
  buildQueryFilter,
  ICursorConnection,
  TOutputFilter,
  IPageInfo,
  Edge,
} from '../utils';

describe('Cursor utils', () => {
  it('nodeToEdge. Should return GraphQL Edge', done => {
    const edge = nodeToEdge({
      cursor: 1,
      name: 'Some name',
    });

    expect(edge).toMatchObject({
      cursor: expect.any(String),
      node: {
        cursor: expect.any(Number),
        name: expect.any(String),
      },
    });

    done();
  });

  it('stringToCursor. Should return string', done => {
    expect(typeof stringToCursor(123)).toBe('string');
    expect(typeof stringToCursor('123')).toBe('string');
    done();
  });

  it('buildCursorConnection. Should return GraphQL cursor connection object', done => {
    const connection = buildCursorConnection({
      totalCount: 15,
      limit: 2,
      nodes: [
        {
          cursor: 1,
          name: 'Jack',
        },
        {
          cursor: 2,
          name: 'Michael',
        },
      ],
    });

    expect(connection).toMatchObject<ICursorConnection<{ name: string; cursor: number }>>({
      totalCount: expect.any(Number),
      pageInfo: expect.objectContaining<IPageInfo>({
        hasPreviousPage: expect.any(Boolean),
        hasNextPage: expect.any(Boolean),
      }),
      edges: expect.arrayContaining<Array<Edge<{ cursor: number; name: string }>>>([
        expect.objectContaining({
          cursor: expect.any(String),
          node: expect.objectContaining({
            name: expect.any(String),
            cursor: expect.any(Number),
          }),
        }),
      ]),
    });

    done();
  });

  it('buildQueryFilter. Should return filter object for Knex', done => {
    const queryFilter = {
      first: 6,
    };
    const knexFilter = buildQueryFilter(queryFilter);

    expect(knexFilter).toMatchObject<TOutputFilter>({
      limit: expect.any(Number),
      where: expect.any(Function),
      orderBy: expect.arrayContaining<TOutputFilter['orderBy']>([
        expect.objectContaining<TOutputFilter['orderBy'][0]>({
          column: 'cursor',
          order: expect.any(String),
        }),
      ]),
    });

    done();
  });
});
