import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

import { IContext } from '../../app';
import {
  TWhereAction,
  TOutputFilter,
  IListResponse,
  convertWhereToKnex,
  convertOrderByToKnex,
  convertJsonToKnex,
} from '../../utils';
import AuthService from '../auth/service';

export enum AccountStatus {
  allowed = 'allowed',
  forbidden = 'forbidden',
}

class Accounts {
  public props: IProps;

  public constructor(props: IProps) {
    this.props = props;
  }

  public getAccounts(filter: Partial<TOutputFilter>): Promise<IListResponse<IAccount>> {
    const { context } = this.props;
    const { knex } = context;
    const {
      limit,
      offset,
      orderBy,
      where,
    } = filter;

    return knex
      .select<any, Array<IAccount & { totalCount: number }>>(['joined.totalCount', 'accounts.*'])
      .join(
        knex('accounts')
          .select(['id', knex.raw('count(*) over() as "totalCount"')])
          .limit(limit || 0)
          .offset(offset || 0)
          .where((builder) => convertWhereToKnex(builder, where))
          .orderBy(convertOrderByToKnex(orderBy))
          .as('joined'),
        'joined.id',
        'accounts.id',
      )
      .orderBy(convertOrderByToKnex(orderBy))
      .from('accounts')
      .then((nodes) => ({
        totalCount: nodes.length ? Number(nodes[0].totalCount) : 0,
        limit,
        offset,
        nodes,
      }));
  }

  public async getAccountsByIds(ids: string[]): Promise<IAccount[]> {
    const { nodes } = await this.getAccounts({
      where: [['id', TWhereAction.IN, ids]],
      offset: 0,
      limit: ids.length,
    });

    return nodes;
  }

  public async getAccount(id: string): Promise<IAccount | false> {
    const nodes = await this.getAccountsByIds([id]);
    return nodes.length ? nodes[0] : false;
  }

  public async getAccountByLogin(login: string): Promise<IAccount | false> {
    const { nodes } = await this.getAccounts({
      limit: 1,
      offset: 0,
      where: [['login', TWhereAction.EQ, login]],
    });

    return nodes.length ? nodes[0] : false;
  }


  public async updateAccount(id: string, accountData: Partial<IAccountUpdateInfo>) {
    const { knex, timezone } = this.props.context;

    await knex<IAccountUpdateInfo & {[key:string]: any}>('accounts')
      .update({
        ...accountData,
        updatedAt: moment.tz(timezone).format(),
      })
      .where('id', id);
  }

  public async createAccount(accountData: Partial<IAccountCreateInfo>) {
    const { knex, timezone } = this.props.context;
    const createdAt = moment.tz(timezone).format();

    const result = await knex<IAccountCreateInfo & { updatedAt: string; createdAt: string; roles: any }>('accounts')
      .insert({
        ...accountData,
        id: accountData.id ? accountData.id : uuidv4(),
        roles: convertJsonToKnex(knex, accountData.roles),
        password: AuthService.cryptUserPassword(accountData.password),
        createdAt,
        updatedAt: createdAt,
      }).returning('id');

    return result[0];
  }

  public async deleteAccount(id: string) {
    return this.updateAccount(id, {
      login: uuidv4(),
      password: uuidv4(),
      deleted: true,
      status: AccountStatus.forbidden,
    });
  }
}

export default Accounts;

interface IProps {
  context: IContext;
}


export type IAccountRole = string;

export interface IAccount {
  id: string;
  name: string;
  login: string;
  password: string;
  status: AccountStatus;
  roles: IAccountRole[];
  createdAt: Date;
  updatedAt: Date;
  deleted: Boolean;
}

export type IAccountUpdateInfo = Omit<IAccount, 'id' | 'createdAt' | 'updatedAt'>;

export type IAccountCreateInfo = Omit<IAccount, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
}
