import { buildQueryFilter } from '../utils/filters';

describe('Filters', () => {
  test('Build query filter', () => {
    const filter = buildQueryFilter({
      first: 12,
      filter: {
        color: ['red', 'green'],
        size: 16,
      },
    });
    expect(filter.where).toEqual(expect.arrayContaining([['color', 'in', ['red', 'green']]]));
    expect(filter.where).toEqual(expect.arrayContaining([['size', '=', 16]]));
    expect(filter.offset).toEqual(0);
  });
});
