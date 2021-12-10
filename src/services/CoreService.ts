import type {
  CoreServiceProps,
  CoreService as CoreServiceInterface,
  MakeGraphQLRequestParams,
} from '@via-profit-services/core';
import { execute, parse, Source, ExecutionResult } from 'graphql';

class CoreService implements CoreServiceInterface {
  public props: CoreServiceProps;

  public constructor(props: CoreServiceProps) {
    this.props = props;
  }

  public async makeGraphQLRequest<T = ExecutionResult['data']>(params: MakeGraphQLRequestParams) {
    const { context } = this.props;
    const { schema } = context;
    const { variables, query, operationName } = params;

    const documentAST = parse(new Source(query, 'GraphQL internal request'));
    const response = await execute({
      variableValues: variables,
      document: documentAST,
      contextValue: context,
      schema,
      operationName: operationName,
    });

    return response as T;
  }

  public getVersion() {
    return process.env.CORE_VERSION;
  }
}

export default CoreService;
