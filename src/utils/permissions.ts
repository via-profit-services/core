import { rule } from 'graphql-shield';

import { IContext } from '../app';
import { IAccessToken } from '../schemas/auth/service';

export enum Role {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
}

export const isAuthenticated = rule()(
  async (parent, args, ctx: IContext) => String(ctx?.token?.uuid) !== '',
);

export const isAdmin = rule()(
  async (parent, args, ctx: IContext) => ctx?.token?.roles.includes(Role.ADMIN),
);

export const isOwner = rule()(
  async (token: IAccessToken['payload'], args, ctx: IContext) => ctx?.token?.uuid === token?.uuid,
);

export const isDeveloper = rule()(
  async (parent, args, ctx: IContext) => ctx.token.roles.includes(Role.DEVELOPER),
);
