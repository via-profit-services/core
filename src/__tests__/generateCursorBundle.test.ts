import faker from 'faker/locale/ru';
import { v4 as uuidv4 } from 'uuid';
import {
  nodeToEdge,
  makeNodeCursor,
  getCursorPayload,
  buildCursorConnection,
  ICursorConnection,
  IPageInfo,
  Edge,
  Node,
  TWhereAction,
  ICursorPayload,
  IDirectionRange,
} from '../utils';

const generateNodes = (quantity: number):
    Node<{ name: string }>[] => [...new Array(quantity).keys()].map(() => ({
  id: uuidv4(),
  name: faker.name.findName(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.past(),
}));

describe('Cursor utils', () => {
  it('nodeToEdge. Should return GraphQL Edge', (done) => {
    const node = generateNodes(1)[0];
    const cursorPayload: ICursorPayload = {
      limit: 2,
      offset: 0,
      where: [['status', TWhereAction.GT, 16]],
      orderBy: [{ field: 'name', direction: IDirectionRange.DESC }],
    };
    const edge = nodeToEdge(node, 'test', cursorPayload);

    expect(edge).toMatchObject({
      cursor: expect.any(String),
      node: {
        name: expect.any(String),
      },
    });

    done();
  });

  it('getNodeCursor. Should return an array of ICursor implementation', (done) => {
    const cursorPayload: ICursorPayload = {
      limit: 2,
      offset: 0,
      where: [['status', TWhereAction.GT, 16]],
      orderBy: [{ field: 'name', direction: IDirectionRange.DESC }],
    };
    const cursor = makeNodeCursor('test', cursorPayload);
    expect(typeof cursor).toBe('string');
    expect(getCursorPayload(cursor)).toEqual(cursorPayload);
    done();
  });

  it('buildCursorConnection. Should return GraphQL cursor connection object', (done) => {
    const connection = buildCursorConnection({
      totalCount: 15,
      limit: 2,
      offset: 1,
      where: [['status', TWhereAction.GT, 16]],
      orderBy: [{ field: 'name', direction: IDirectionRange.DESC }],
      nodes: generateNodes(2),
    }, 'test');

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
