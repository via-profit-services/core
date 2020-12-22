import type { Middleware } from '@via-profit-services/core';
import { ValidationRule, GraphQLError } from 'graphql';

type MiddlewareFactory = () => Middleware;

const introspectionMiddlewareFactory: MiddlewareFactory = () => {
  const middleware: Middleware = ({ config, context }) => {
    const { introspection } = config;

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
      validationRule: !introspection
        ? validationRule
        : undefined,
    }
  }

  return middleware;
}

export default introspectionMiddlewareFactory;