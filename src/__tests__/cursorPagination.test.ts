import faker from 'faker/locale/ru';
import { v4 as uuidv4 } from 'uuid';

import { buildCursorConnection, Node } from '../utils';

const generateNodes = (quantity: number):
  Node<{ name: string }>[] => [...new Array(quantity).keys()].map(() => ({
  id: uuidv4(),
  name: faker.name.findName(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.past(),
}));

describe('Cursor Pagination', () => {
  it('Should return [false] for [hasPreviousPage] and [false] for [hasNextPage] with offset 0 and limit 2 and totalCount 11', (done) => {
    const connection = buildCursorConnection({
      nodes: generateNodes(2),
      totalCount: 11,
      limit: 2,
      offset: 0,
      orderBy: [],
      where: [],
    }, 'test');
    expect(connection.pageInfo.hasPreviousPage).toBeFalsy();
    expect(connection.pageInfo.hasNextPage).toBeTruthy();
    done();
  });

  it('Should return [true] for both [hasPreviousPage] and [hasNextPage] with offset 1 and limit 2 and totalCount 11', (done) => {
    const connection = buildCursorConnection({
      nodes: generateNodes(2),
      totalCount: 11,
      limit: 2,
      offset: 1,
    });
    expect(connection.pageInfo.hasPreviousPage).toBeTruthy();
    expect(connection.pageInfo.hasNextPage).toBeTruthy();
    done();
  });

  it('Should return [true] for [hasPreviousPage] and [false] for [hasNextPage] with offset 10 and limit 2 and totalCount 11', (done) => {
    const connection = buildCursorConnection({
      nodes: generateNodes(2),
      totalCount: 11,
      limit: 2,
      offset: 10,
    });
    expect(connection.pageInfo.hasPreviousPage).toBeTruthy();
    expect(connection.pageInfo.hasNextPage).toBeFalsy();
    done();
  });

  it('Should return [false] for [hasPreviousPage] and [false] for [hasNextPage] with offset 0 and limit 15 and totalCount 11', (done) => {
    const connection = buildCursorConnection({
      nodes: generateNodes(2),
      totalCount: 11,
      limit: 15,
      offset: 0,
    });
    expect(connection.pageInfo.hasPreviousPage).toBeFalsy();
    expect(connection.pageInfo.hasNextPage).toBeFalsy();
    done();
  });
});
