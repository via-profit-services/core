import { convertOrderByToKnex, IDirectionRange, TOrderByKnex } from '../utils';

describe('Any utils', () => {
  it('convertOrderByToKnex. Should return knex OrderBy implementation array', done => {
    const converted = convertOrderByToKnex([{ field: 'name', direction: IDirectionRange.DESC }]);
    const expected: TOrderByKnex = [{ column: 'name', order: IDirectionRange.DESC }];
    expect(converted).toEqual<TOrderByKnex>(expected);
    done();
  });
});
