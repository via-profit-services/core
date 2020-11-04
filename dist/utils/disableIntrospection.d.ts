import { ValidationContext, GraphQLType } from 'graphql';
export declare const noIntrospectionAllowedMessage: (fieldName: string, type: GraphQLType) => string;
/**
 * Disable Introspection Queries
 *
 * A GraphQL document is valid only if it contains no introspection types.
 */
export declare const DisableIntrospectionQueries: (context: ValidationContext) => any;
