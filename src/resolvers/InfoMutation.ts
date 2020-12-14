import { Context } from '@via-profit-services/core';

export interface InfoMutationArgs {
  str: string;
}

const InfoMutation = {
  echo: (_parents: any, args: InfoMutationArgs, context: Context) => {
    // const { pubsub } = context;
    const { str } = args;

    // pubsub.publish('info', {
    //   info: str,
    // });

    return str;
  },
};

export default InfoMutation;
