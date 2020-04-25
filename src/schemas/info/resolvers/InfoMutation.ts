import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';

const infoMutationResolver: IResolverObject<any, IContext> = {
  echo: (parent, { str }: { str: string }, context) => {
    const { pubsub } = context;

    pubsub.publish('info', {
      info: str,
    });


    return str;
  },
};


export default infoMutationResolver;
