import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { IAccount } from '../../../authentificator';
import { DataLoader } from '../../../utils';

import createDataloader from '../dataloader';


let dataloader: DataLoader<string, IAccount>;

const accountResolver: IResolverObject<Pick<IAccount, 'id'>, IContext> = {
  id: async ({ id }) => id,
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
  name: async ({ id }, args, context) => {
    dataloader = dataloader || createDataloader(context);
    const data = await dataloader.load(id);
    return data.name;
  },
  login: async ({ id }, args, context) => {
    dataloader = dataloader || createDataloader(context);
    const data = await dataloader.load(id);
    return data.login;
  },
  password: async ({ id }, args, context) => {
    dataloader = dataloader || createDataloader(context);
    const data = await dataloader.load(id);
    return data.password;
  },
  roles: async ({ id }, args, context) => {
    dataloader = dataloader || createDataloader(context);
    const data = await dataloader.load(id);
    return data.roles;
  },
};

export default accountResolver;
