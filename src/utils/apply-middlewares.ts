import type { Context, Configuration, Middleware, MaybePromise } from '@via-profit-services/core';
import type { Request } from 'express';
import type { ValidationRule, GraphQLSchema } from 'graphql';


interface ApplyMiddlewareProps {
  middlewares: Middleware[];
  context: Context;
  config: Configuration;
  schema: GraphQLSchema;
  request: Request;
}

interface ApplyMiddlewareResponse {
  context: Context;
  schema: GraphQLSchema;
  validationRules: ValidationRule[];

}

type ApplyMiddleware = (props: ApplyMiddlewareProps) => MaybePromise<ApplyMiddlewareResponse>;

const applyMiddlewares: ApplyMiddleware = async (props) => {
  const { middlewares, config, context, schema, request } = props;


  // define validation rules and new context
  let composedValidationRules: ValidationRule[] = [];
  let composedContext: Context = { ...context };
  let composedSchema: GraphQLSchema = schema;

  await middlewares.reduce(async (prev, middleware) => {
    await prev;

    // init middleware
    const mdlwreData = await middleware({
      config,
      schema: composedSchema,
      context: composedContext,
      request,
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

  }, Promise.resolve())


  return {
    context: composedContext,
    validationRules: composedValidationRules,
    schema: composedSchema,
  }
}

export default applyMiddlewares;
