import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { IAccount, Authentificator, IAccountUpdateInfo } from '../../../authentificator';
import { ServerError } from '../../../errorHandlers';
import { DataLoader } from '../../../utils';
import createDataloader from '../dataloader';


let dataloader: DataLoader<string, IAccount>;

const driversMutationResolver: IResolverObject<any, IContext> = {
  updateAccount: async (parent, args: { id: string; data: IAccountUpdateInfo }, context) => {
    const { id, ...otherData } = args;
    dataloader = dataloader || createDataloader(context);
    const autherntificator = new Authentificator({ context });

    try {
      await autherntificator.updateAccount(id, otherData.data);
    } catch (err) {
      throw new ServerError('Failed to update account');
    }

    dataloader.clear(id);
    return { id };
  },
};

export default driversMutationResolver;
