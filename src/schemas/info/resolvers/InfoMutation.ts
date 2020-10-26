import { IObjectTypeResolver } from 'graphql-tools';

import { IContext } from '../../../types';

const infoMutationResolver: IObjectTypeResolver<any, IContext> = {
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
