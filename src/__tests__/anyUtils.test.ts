import {
  convertOrderByToKnex, IDirectionRange, TOrderByKnex,
  TTableAliases, applyAliases, TWhere, TWhereAction,
} from '../utils';

describe('Any utils', () => {
  it('convertOrderByToKnex. Should return knex OrderBy implementation array', (done) => {
    const converted = convertOrderByToKnex([{ field: 'name', direction: IDirectionRange.DESC }]);
    const expected: TOrderByKnex = [{ column: 'name', order: IDirectionRange.DESC }];
    expect(converted).toEqual<TOrderByKnex>(expected);
    done();
  });


  it('applyAliases. Should return TWhere array with aliases', (done) => {
    const where: TWhere = [
      ['title', TWhereAction.EQ, 'Star Wars'],
      ['color', TWhereAction.EQ, 'Red'],
      ['pages', TWhereAction.GT, 100],
    ];
    const aliases: TTableAliases = {
      colors: 'color',
      books: ['title', 'length'],
      tbl: '*',
    };

    const expected: TWhere = [
      ['books.title', TWhereAction.EQ, 'Star Wars'],
      ['colors.color', TWhereAction.EQ, 'Red'],
      ['tbl.pages', TWhereAction.GT, 100],
    ];
    const applyed = applyAliases(where, aliases);
    expect(applyed).toEqual<TWhere>(expected);
    done();
  });
});
