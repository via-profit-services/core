import { shield, or } from 'graphql-shield';

import { IContext } from '../../types';

import {
  isAdmin,
  isAuthenticated,
  isDeveloper,
  isOwner,
} from '../../utils/permissions';

export const permissions = shield<any, IContext>({
  Subscription: isAuthenticated,
  Account: {
    login: or(isDeveloper, isOwner, isAdmin),
    password: or(isDeveloper, isOwner, isAdmin),
  },
  AccountsMutation: {
    deleteAccount: or(isDeveloper, isAdmin),
    createAccount: or(isDeveloper, isAdmin),
    updateAccount: or(isDeveloper, isAdmin),
  },
});

export default permissions;
