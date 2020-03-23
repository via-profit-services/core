import { IFieldResolver, IResolverObject } from 'graphql-tools';
import { IContext } from '../../../app';
import { DEV_INFO_DEVELOPER_NAME, DEV_INFO_DEVELOPER_URL } from '../../../utils/constants';

export const InfoQuery: IResolvers<any, IContext> = {
  developer: () => {
    const developerInfo: IDeveloperInfo = {
      name: DEV_INFO_DEVELOPER_NAME,
      url: DEV_INFO_DEVELOPER_URL,
    };

    return developerInfo;
  },
};

interface IResolvers<TSource, TContext> extends IResolverObject {
  developer: IFieldResolver<TSource, TContext>;
}

interface IDeveloperInfo {
  name: string;
  url: string;
}

export default InfoQuery;
