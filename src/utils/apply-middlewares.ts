import type { Context, Configuration, Middleware } from '@via-profit-services/core';
import type { ValidationRule } from 'graphql';

interface ApplyMiddlewareProps {
  middleware: Middleware[];
  context: Context;
  config: Configuration;
}

interface ApplyMiddlewareResponse {
  context: Context;
  validationRules: ValidationRule[];
}

type ApplyMiddleware = (props: ApplyMiddlewareProps) => ApplyMiddlewareResponse;

const applyMiddlewares: ApplyMiddleware = (props) => {
  const { middleware, config, context } = props;

  // define validation rules and new context
  let composedValidationRules: ValidationRule[] = [];
  let composedContext: Context = { ...context };

  middleware.forEach((mdlwre) => {

    // init middleware
    const mdlwreData = mdlwre({
      config,
      context: composedContext,
    });

    // append validation rules
    if (mdlwreData.validationRule) {
      const rules: ValidationRule[] = Array.isArray(mdlwreData.validationRule)
        ? mdlwreData.validationRule
        : [mdlwreData.validationRule];

      composedValidationRules = composedValidationRules.concat(rules);
    }

    // combine context
    composedContext = {
      ...composedContext,
      ...mdlwreData.context,
    };

  });

  return {
    context: composedContext,
    validationRules: composedValidationRules,
  }
}

export default applyMiddlewares;
