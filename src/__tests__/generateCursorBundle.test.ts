import faker from 'faker/locale/ru';
import { v4 as uuidv4 } from 'uuid';
import {
  nodeToEdge,
  makeNodeCursor,
  getNodeCursor,
  buildCursorConnection,
  ICursorConnection,
  IPageInfo,
  IDirectionRange,
  Edge,
  Node,
} from '../utils';

const generateNodes = (quantity: number): Node<{ name: string }>[] => {
  return [...new Array(quantity).keys()].map(() => ({
    id: uuidv4(),
    name: faker.name.findName(),
    createdAt: faker.date.past(),
  }));
};

describe('Cursor utils', () => {
  it('nodeToEdge. Should return GraphQL Edge', done => {
    const node = generateNodes(1)[0];
    const edge = nodeToEdge(node, [
      {
        direction: IDirectionRange.DESC,
        field: 'createdAt',
      },
    ]);

    expect(edge).toMatchObject({
      cursor: expect.any(String),
      node: {
        name: expect.any(String),
      },
    });

    done();
  });

  it('getNodeCursor. Should return an array of ICursor implementation', done => {
    const node = generateNodes(1)[0];
    const cursor = makeNodeCursor(
      {
        ...node,
        createdAt: new Date('2020-01-02 12:56:33'),
      },
      [
        {
          direction: IDirectionRange.DESC,
          field: 'createdAt',
        },
      ],
    );
    expect(typeof cursor).toBe('string');
    expect(getNodeCursor(cursor)).toEqual(
      expect.arrayContaining([['createdAt', '<', new Date('2020-01-02 12:56:33').toISOString()]]),
    );
    done();
  });

  it('buildCursorConnection. Should return GraphQL cursor connection object', done => {
    const connection = buildCursorConnection({
      totalCount: 15,
      limit: 2,
      nodes: generateNodes(2),
      offset: 1,
      orderBy: [
        {
          field: 'name',
          direction: IDirectionRange.DESC,
        },
      ],
    });

    interface NodeData {
      id: string;
      name: string;
      createdAt: Date;
    }

    expect(connection).toMatchObject<ICursorConnection<NodeData>>({
      totalCount: expect.any(Number),
      pageInfo: expect.objectContaining<IPageInfo>({
        endCursor: expect.any(String),
        startCursor: expect.any(String),
        hasPreviousPage: expect.any(Boolean),
        hasNextPage: expect.any(Boolean),
      }),
      edges: expect.arrayContaining<Array<Edge<NodeData>>>([
        expect.objectContaining({
          cursor: expect.any(String),
          node: expect.objectContaining({
            name: expect.any(String),
            createdAt: expect.any(Date),
          }),
        }),
      ]),
    });

    done();
  });
});
