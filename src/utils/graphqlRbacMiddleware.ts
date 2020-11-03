import { IMiddleware } from 'graphql-middleware';

// import { GraphQLResolveInfo } from 'graphql';
import { IContext } from '../types';


const graphqlRbacMiddleware: IMiddleware<any, IContext> = async (
  resolve, root, args, context, info) => {
  // console.log('middleware', info);
  const result = await resolve(root, args, context, info);

  return result;
};


export default graphqlRbacMiddleware;
