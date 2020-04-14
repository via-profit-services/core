import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../app';
import { IAccount } from '../service';
declare const accountResolver: IResolverObject<Pick<IAccount, 'id'>, IContext>;
export default accountResolver;
