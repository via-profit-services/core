import { IResolverObject } from 'graphql-tools';
import { IContext } from '../../../types';
interface IParent {
    id: string;
}
declare const accountResolver: IResolverObject<IParent, IContext, any>;
export default accountResolver;
