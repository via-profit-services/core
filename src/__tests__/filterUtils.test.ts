import { buildQueryFilter, TWhereAction } from '../utils';

describe('Filter utils', () => {
  it('Search by single field', (done) => {
    const { search } = buildQueryFilter({
      search: {
        field: 'name',
        query: 'Ivan',
      },
    });

    expect(search).toEqual(expect.arrayContaining(
      [{
        field: 'name',
        query: 'Ivan',
      }],
    ));

    done();
  });


  it('Search by aeeay of silngle field', (done) => {
    const { search } = buildQueryFilter({
      search: [
        {
          field: 'name',
          query: 'Ivan',
        },
        {
          field: 'surname',
          query: 'Ivanov',
        },
      ],
    });

    expect(search).toEqual(expect.arrayContaining(
      [
        {
          field: 'name',
          query: 'Ivan',
        },
        {
          field: 'surname',
          query: 'Ivanov',
        },
      ],
    ));

    done();
  });
  it('Search by multiple fields', (done) => {
    const { search } = buildQueryFilter({
      search: {
        fields: ['name', 'surname'],
        query: 'Ivan',
      },
    });

    expect(search).toEqual(expect.arrayContaining(
      [
        {
          field: 'name',
          query: 'Ivan',
        },
        {
          field: 'surname',
          query: 'Ivan',
        },
      ],
    ));

    done();
  });

  it('Where clause. Should return where', (done) => {
    const { where } = buildQueryFilter({
      filter: {
        status: ['active', 'dismissed'],
        digit: 'one',
        state: 'on',
      },
    });

    const expected = [
      ['status', TWhereAction.IN, ['active', 'dismissed']],
      ['digit', TWhereAction.EQ, 'one'],
      ['state', TWhereAction.EQ, 'on'],
    ];

    expect(where).toEqual(expected);

    done();
  });

  it('Between. Should return between', (done) => {
    const { between } = buildQueryFilter({
      between: {
        price: {
          start: 1500,
          end: 16000,
        },
      },
    });

    const expected = {
      price: {
        start: 1500,
        end: 16000,
      },
    };

    expect(between).toEqual(expected);

    done();
  });
});
