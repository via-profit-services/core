import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { IAccount } from '../../../authentificator';
import { DataLoader } from '../../../utils';

import createDataloader from '../dataloader';


let dataloader: DataLoader<string, IAccount>;

const driverResolver: IResolverObject<Pick<IAccount, 'id'>, IContext> = {
  createdAt: async ({ id }, args, context) => {
    dataloader = dataloader || createDataloader(context);
    const data = await dataloader.load(id);
    return data.createdAt;
  },
  updatedAt: async ({ id }, args, context) => {
    dataloader = dataloader || createDataloader(context);
    const data = await dataloader.load(id);
    return data.updatedAt;
  },
  status: async ({ id }, args, context) => {
    dataloader = dataloader || createDataloader(context);
    const data = await dataloader.load(id);
    return data.status;
  },
};

export default driverResolver;
