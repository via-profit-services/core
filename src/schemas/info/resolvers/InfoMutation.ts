import { IResolverObject } from 'graphql-tools';

import { IContext } from '../../../app';
import { pubsub } from '../../../utils';
import { IDeveloper, Developer } from '../service';

const infoMutationResolver: IResolverObject<any, IContext> = {
  echo: (parent, { str }: { str: string }) => str,
  updateDeveloper: (parent, args: Partial<IDeveloper>) => {
    const developer = {
      ...Developer,
      ...args,
    };

    pubsub.publish('developerWasChanged', {
      developerWasChanged: developer,
    });
    return developer;
  },
};

export default infoMutationResolver;
