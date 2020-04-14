import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { pubsub } from '../../../utils';

const infoMutationResolver: IResolverObject<any, IContext> = {
  echo: (parent, { str }: { str: string }) => {
    pubsub.publish('info', {
      info: str,
    });
    return str;
  },
};

export default infoMutationResolver;
