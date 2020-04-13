import {
  GraphQLError, ValidationContext, GraphQLType, FieldNode,
} from 'graphql';

const INTROSPECTION_TYPES = ['__Schema!', '__Type!'];

export const noIntrospectionAllowedMessage = (
  fieldName: string,
  type: GraphQLType,
): string => (
  'Introspection has been disabled for this schema. The field '
    + `"${fieldName}" of type "${String(type)}" is not allowed.`
);

/**
 * Disable Introspection Queries
 *
 * A GraphQL document is valid only if it contains no introspection types.
 */
export const DisableIntrospectionQueries = (context: ValidationContext): any => ({
  Field(node: FieldNode) {
    const type = context.getType();
    if (type) {
      if (INTROSPECTION_TYPES.indexOf(String(type)) >= 0) {
        context.reportError(
          new GraphQLError(
            noIntrospectionAllowedMessage(node.name.value, type),
          ),
        );
      }
    }
  },
});
