import { IFieldResolver, IResolverObject } from 'graphql-tools';
import { IContext } from '../../../../app';
import { buildCursorConnection, buildQueryFilter, TInputFilter } from '../../../../utils';
import DriverService from '../driversService';

export const DriversQuery: IResolvers<any, IContext> = {
  list: async (obj, args, context) => {
    const filter = buildQueryFilter(args);
    const driverService = new DriverService({ context });
    const driversConnection = await driverService.getDrivers(filter);
    const connection = buildCursorConnection(driversConnection);

    return connection;
  },
  t: async (obj, args, context) => {
    const { knex } = context;

    // const timeEktAsString = '2020-03-16T18:44:18+05:00';

    // await knex('drivers')
    //   .update({
    //     createdAt: timeEktAsString,
    //   })
    //   .where({ id: 'c6ae208d-b2bf-4ffe-9760-648039bd43aa' });

    const res = await knex.raw(
      'select id, "createdAt" from drivers where id = \'c6ae208d-b2bf-4ffe-9760-648039bd43aa\'',
    );
    console.log(res.rows[0]);

    return 't';
  },
};

interface IResolvers<TSource, TContext> extends IResolverObject {
  list: IFieldResolver<TSource, TContext, TInputFilter>;
  t: IFieldResolver<TSource, TContext>;
}

export default DriversQuery;
