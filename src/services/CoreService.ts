import type {
  CoreServiceProps,
  CoreService as CoreServiceInterface,
  MakeGraphQLRequestParams,
  Context,
} from '@via-profit-services/core';
import { execute, parse, Source, ExecutionResult, GraphQLSchema } from 'graphql';

class CoreService implements CoreServiceInterface {
  public props: CoreServiceProps;

  public constructor(props: CoreServiceProps) {
    this.props = props;
  }

  public async makeGraphQLRequest<T = ExecutionResult['data']>(params: MakeGraphQLRequestParams) {
    return CoreService.makeGraphQLRequest<T>(
      { ...params, schema: this.props.context.schema },
      this.props.context,
    );
  }

  public getVersion() {
    return CoreService.getVersion();
  }

  public static getVersion() {
    return process.env.CORE_VERSION;
  }

  public static async makeGraphQLRequest<T = ExecutionResult['data']>(
    params: MakeGraphQLRequestParams & {
      schema: GraphQLSchema;
    },
    context: Context,
  ) {
    const { variables, query, operationName, schema } = params;
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
}

export default CoreService;
