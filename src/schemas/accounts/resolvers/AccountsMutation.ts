import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { ServerError } from '../../../errorHandlers';
// import { pubsub } from '../../../utils';
import createLoaders from '../loaders';
import AccountsService, { IAccountUpdateInfo, IAccountCreateInfo } from '../service';
// import { SubscriptioTriggers } from './AccountsSubscription';

const driversMutationResolver: IResolverObject<any, IContext> = {
  updateAccount: async (parent, args: { id: string; data: IAccountUpdateInfo }, context) => {
    const { id, ...otherData } = args;
    const loaders = createLoaders(context);
    const accountsService = new AccountsService({ context });

    try {
      await accountsService.updateAccount(id, otherData.data);
    } catch (err) {
      throw new ServerError('Failed to update account', { data: otherData, id });
    }
    loaders.accounts.clear(id);

    // const account = await loaders.accounts.load(id);
    // pubsub.publish(SubscriptioTriggers.ACCOUNT_UPDATED, {
    //   accountWasUpdated: account,
    // });


    return { id };
  },
  createAccount: async (parent, args: { data: IAccountCreateInfo }, context) => {
    const { data } = args;
    const accountsService = new AccountsService({ context });

    // check account exists by login
    const account = await accountsService.getAccountByLogin(data.login);
    if (!account) {
      throw new ServerError(`Account with login ${data.login} already exists`, { data });
    }

    // create account
    try {
      const id = await accountsService.createAccount(data);

      return { id };
    } catch (err) {
      throw new ServerError('Failed to create account', { data });
    }
  },
  deleteAccount: async (parent, args: { id: string }, context) => {
    const { id } = args;
    const accountsService = new AccountsService({ context });
    const loaders = createLoaders(context);

    try {
      const result = await accountsService.deleteAccount(id);
      loaders.accounts.clear(id);

      // pubsub.publish(SubscriptioTriggers.ACCOUNT_DELETED, {
      //   accountWasDeleted: [id],
      // });

      return Boolean(result);
    } catch (err) {
      throw new ServerError(`Failed to delete account with id ${id}`, { id });
    }
  },
};

export default driversMutationResolver;
