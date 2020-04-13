import { shield, allow, or } from 'graphql-shield';

import { IContext } from '../../app';
import { ForbiddenError } from '../../errorHandlers';
import {
  isAuthenticated, isOwner, isDeveloper, isAdmin,
} from '../../utils/permissions';


export const permissions = shield<any, IContext>({
  Mutation: {
    auth: allow,
  },
  AuthMutation: {
    getAccessToken: allow,
    refreshToken: allow,
    revokeToken: or(isOwner, isDeveloper, isAdmin),
  },
  TokensBag: allow,
  AccessTokenBag: allow,
  AccessTokenPayload: allow,
  RefreshTokenBag: allow,
  RefreshTokenPayload: allow,
  TokenType: allow,
}, {
  fallbackRule: isAuthenticated,
  allowExternalErrors: true,
  fallbackError: (err, parent, args, ctx, info) => new ForbiddenError('Permission denied. You don\'t have access to these field[s]', {
    fieldName: info.fieldName,
    fieldNodes: info.fieldNodes,
    returnType: info.returnType,
    parentType: info.parentType,
    path: info.path,
    fragments: info.fragments,
  }),
});

export default permissions;
