import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../types';
import { IAccount } from '../service';
declare const accountResolver: IResolverObject<Pick<IAccount, 'id'>, IContext>;
export default accountResolver;
