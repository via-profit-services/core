import { Context } from '../../types';

const defaultResolvers = {
  Query: {
    info: () => ({}),
  },
  Mutation: {
    info: () => ({}),
  },
  Subscription: {
    info: {
      subscribe: (parent: any, args: any, context: Context) => context.pubsub.asyncIterator('info'),
    },
  },
  InfoQuery: {
    developer: () => ({
      name: () => 'Via Profit',
      url: () => 'https://via-profit.ru',
      email: () => '1@e1g.ru',
    }),
  },
  InfoMutation: {
    echo: (parent: any, args: {str: string}, context: Context) => {
      const { pubsub } = context;
      const { str } = args;

       pubsub.publish('info', {
        info: str,
      });


      return str;
    },
  },
}

export default defaultResolvers;
