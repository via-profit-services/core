import type { Context, Configuration, Middleware } from '@via-profit-services/core';
import type { ValidationRule, GraphQLSchema } from 'graphql';

interface ApplyMiddlewareProps {
  middleware: Middleware[];
  context: Context;
  config: Configuration;
  schema: GraphQLSchema;
}

interface ApplyMiddlewareResponse {
  context: Context;
  schema: GraphQLSchema;
  validationRules: ValidationRule[];

}

type ApplyMiddleware = (props: ApplyMiddlewareProps) => ApplyMiddlewareResponse;

const applyMiddlewares: ApplyMiddleware = (props) => {
  const { middleware, config, context, schema } = props;


  // define validation rules and new context
  let composedValidationRules: ValidationRule[] = [];
  let composedContext: Context = { ...context };
  let composedSchema: GraphQLSchema = schema;

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

    // replace context
    composedContext = mdlwreData.context || context;

    // replace schema
    composedSchema = mdlwreData.schema || schema;

  });

  return {
    context: composedContext,
    validationRules: composedValidationRules,
    schema: composedSchema,
  }
}

export default applyMiddlewares;
