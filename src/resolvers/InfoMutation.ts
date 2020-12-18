export interface InfoMutationArgs {
  str: string;
}

const InfoMutation = {
  echo: (_parents: any, args: InfoMutationArgs) => {
    const { str } = args;

    return str;
  },
};

export default InfoMutation;
