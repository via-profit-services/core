import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import {
  Authentificator, IAccountUpdateInfo, IAccountCreateInfo,
} from '../../../authentificator';
import { ServerError } from '../../../errorHandlers';
import createLoaders from '../dataloader';

const driversMutationResolver: IResolverObject<any, IContext> = {
  updateAccount: async (parent, args: { id: string; data: IAccountUpdateInfo }, context) => {
    const { id, ...otherData } = args;
    const loaders = createLoaders(context);
    const autherntificator = new Authentificator({ context });

    try {
      await autherntificator.updateAccount(id, otherData.data);
    } catch (err) {
      throw new ServerError('Failed to update account', { data: otherData, id });
    }

    loaders.accounts.clear(id);
    return { id };
  },
  createAccount: async (parent, args: { data: IAccountCreateInfo }, context) => {
    const { data } = args;
    const authentificator = new Authentificator({ context });

    // check account exists by login
    const exists = await authentificator.checkAccountExists(data.login);
    if (exists) {
      throw new ServerError(`Account with login ${data.login} already exists`, { data });
    }

    // create account
    try {
      const id = await authentificator.createAccount(data);

      return { id };
    } catch (err) {
      throw new ServerError('Failed to create account', { data });
    }
  },
  deleteAccount: async (parent, args: { id: string }, context) => {
    const { id } = args;
    const authentificator = new Authentificator({ context });
    const loaders = createLoaders(context);

    try {
      const result = await authentificator.deleteAccount(id);
      loaders.accounts.clear(id);
      return Boolean(result);
    } catch (err) {
      throw new ServerError(`Failed to delete account with id ${id}`, { id });
    }
  },
  revokeToken: async (parent, args: { id: string }, context) => {
    const { id } = args;

    try {
      const authentificator = new Authentificator({ context });
      const result = await authentificator.revokeToken(id);
      return Boolean(result);
    } catch (err) {
      throw new ServerError(`Failed to revoke token ${id}`, { id });
    }
  },
  revokeAllAccountTokens: async (paretn, args: { id: string }, context) => {
    const { id } = args;

    try {
      const authentificator = new Authentificator({ context });
      const result = await authentificator.revokeAccountTokens(id);
      return Boolean(result);
    } catch (err) {
      throw new ServerError('Failed to revoke account tokens', { id });
    }
  },
};

export default driversMutationResolver;
