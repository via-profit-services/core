import { IFieldResolver, IResolverObject } from 'graphql-tools';
import { IContext } from '../../../app';
export declare const InfoQuery: IResolvers<any, IContext>;
interface IResolvers<TSource, TContext> extends IResolverObject {
    developer: IFieldResolver<TSource, TContext>;
}
export default InfoQuery;
