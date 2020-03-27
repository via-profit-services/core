import { IContext } from '../../../app';
import { IListResponse, TOutputFilter, convertOrderByToKnex } from '../../../utils';

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

  public async getDrivers(filter: TOutputFilter): Promise<IListResponse<IDriver>> {
    const { context } = this.props;
    const { knex } = context;
    const { limit, offset, orderBy, where, cursor } = filter;
    const nodes = await knex
      .select<any, Array<IDriver & { totalCount: number }>>(['joined.totalCount', 'drivers.*'])
      .join(
        knex('drivers')
          .select(['id', knex.raw('count(*) over() as "totalCount"')])
          .limit(limit)
          .offset(offset)
          .where(builder => [...where, ...cursor].forEach(data => builder.where(...data)))
          .orderBy(convertOrderByToKnex(orderBy))
          .as('joined'),
        'joined.id',
        'drivers.id',
      )
      .orderBy(convertOrderByToKnex(orderBy))
      .from('drivers');

    return {
      orderBy,
      totalCount: nodes.length ? nodes[0].totalCount : 0,
      limit,
      offset,
      nodes,
    };
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

export default DriversService;
export { DriversService };
