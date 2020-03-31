import moment from 'moment-timezone';
import { IContext } from '../../../app';
import {
  IListResponse, TOutputFilter, convertOrderByToKnex, convertWhereToKnex,
} from '../../../utils';

export enum IDriverLegalStatus {
  PERSON = 'person',
  LEGAL = 'legal',
  ENTREPRENEUR = 'entrepreneur',
}

export enum IDriverStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISMISSED = 'dismissed',
  SICK = 'sick',
  BLOCKED = 'blocked',
  HOLIDAY = 'holiday',
}

class DriversService {
  public props: IProps;

  public constructor(props: IProps) {
    this.props = props;
  }

  public getDrivers(filter: TOutputFilter): Promise<IListResponse<IDriver>> {
    const { context } = this.props;
    const { knex } = context;
    const {
      limit, offset, orderBy, where,
    } = filter;


    return knex
      .select<any, Array<IDriver & { totalCount: number }>>(['joined.totalCount', 'drivers.*'])
      .join(
        knex('drivers')
          .select(['id', knex.raw('count(*) over() as "totalCount"')])
          .limit(limit)
          .offset(offset)
          .where((builder) => convertWhereToKnex(builder, where))
          .orderBy(convertOrderByToKnex(orderBy))
          .as('joined'),
        'joined.id',
        'drivers.id',
      )
      .orderBy(convertOrderByToKnex(orderBy))
      .from('drivers')
      .then((nodes) => ({
        totalCount: nodes.length ? nodes[0].totalCount : 0,
        limit,
        offset,
        nodes,
      }));
  }

  public async getDriver(id: string): Promise<IDriver | false> {
    const { nodes, totalCount } = await this.getDrivers({
      where: [['id', '=', id]],
      offset: 0,
      limit: 1,
      orderBy: [],
      revert: false,
    });

    return totalCount ? nodes[0] : false;
  }

  public async updateDriver(id: string, driverData: Partial<IDriverUpdateInfo>) {
    const { knex, timezone } = this.props.context;

    await knex<IDriverUpdateInfo>('drivers')
      .update({
        ...driverData,
        updatedAt: moment.tz(timezone).format(),
      })
      .where('id', id);
  }
}

interface IProps {
  context: IContext;
}

export interface IDriver {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  legalStatus: IDriverLegalStatus;
  status: IDriverStatus;
}

export type IDriverUpdateInfo = Omit<IDriver, 'id' | 'createdAt' | 'updatedAt'> & {
  updatedAt: string;
}

export default DriversService;
export { DriversService };
