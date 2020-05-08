import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../types';

const infoMutationResolver: IResolverObject<any, IContext> = {
  echo: (parent, args: EchoArgs, context) => {
    const { str } = args;
    const { pubsub } = context;

    pubsub.publish('info', {
      info: str,
    });


    return str;
  },
};

interface EchoArgs {
  str: string;
}

export default infoMutationResolver;
