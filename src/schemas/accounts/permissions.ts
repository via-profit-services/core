import { shield, or, deny } from 'graphql-shield';

import { IContext } from '../../app';
import { ForbiddenError } from '../../errorHandlers';
import {
  isAdmin,
  isDeveloper,
  isOwner,
} from '../../utils/permissions';

export const permissions = shield<any, IContext>({
  Account: {
    login: or(isDeveloper, isOwner, isAdmin),
    password: or(isDeveloper, isOwner, isAdmin),
  },
  AccessTokenPayload: or(isDeveloper, isOwner),
}, {
  fallbackRule: deny,
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
