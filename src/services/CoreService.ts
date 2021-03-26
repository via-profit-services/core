import type { CoreServiceProps, CoreService as CoreServiceInterface, MakeGraphQLRequestParams } from '@via-profit-services/core';
import { execute, parse, Source, ExecutionResult } from 'graphql';

class CoreService implements CoreServiceInterface {
  public props: CoreServiceProps;

  public constructor(props: CoreServiceProps) {
    this.props = props;
  }

  public async makeGraphQLRequest<T = {[key: string]: any;}>(params: MakeGraphQLRequestParams) {
    const { context } = this.props;
    const { schema } = context;
    const { variables, query, operationName } = params;

    const documentAST = parse(new Source(query, 'GraphQL internal request'))
    const response = await execute({
      variableValues: variables,
      document: documentAST,
      contextValue: context,
      schema,
      operationName: operationName,
    });

    return response as ExecutionResult<T>;
  }
}

export default CoreService;
