import { rule } from 'graphql-shield';

import { IContext } from '../app';
import { IAccount } from '../authentificator';
// TODO Permision documentation
export enum Role {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
}

export const isAuthenticated = rule()(
  async (parent, args, ctx: IContext) => ctx.token.uuid !== '',
);

export const isAdmin = rule()(
  async (parent, args, ctx: IContext) => ctx.token.roles.includes(Role.ADMIN),
);

export const isOwner = rule()(
  async (parent: Pick<IAccount, 'id'>, args, ctx: IContext) => ctx.token.uuid === parent.id,
);

export const isDeveloper = rule()(
  async (parent, args, ctx: IContext) => ctx.token.roles.includes(Role.DEVELOPER),
);
