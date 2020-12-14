import type { Middleware } from '@via-profit-services/core';
import { ValidationRule, GraphQLError } from 'graphql';

const introspectionMiddleware: Middleware = ({ config, context }) => {
  const { enableIntrospection } = config;
  const validationRule: ValidationRule = (validationContext) => ({
    Field: (node) => {
      const type = validationContext.getType();

      if (type && ['__Schema!', '__Type!'].indexOf(String(type)) >= 0) {
        const { logger } = context;
        logger.server.debug(
          `Introspection has been disabled. The field «${node.name.value}» of type «${String(type)}» is not allowed`,
        );
        validationContext.reportError(
          new GraphQLError(
            `Introspection has been disabled. The field «${node.name.value}» of type «${String(type)}» is not allowed`,
          ),
        )
      }
    },
  });

  return {
    validationRule: !enableIntrospection
      ? validationRule
      : undefined,
  }
}

export default introspectionMiddleware;
