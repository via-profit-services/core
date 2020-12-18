import type { Context, Configuration, Middleware, MaybePromise, MiddlewareExtensions } from '@via-profit-services/core';
import type { Request } from 'express';
import type { ValidationRule, GraphQLSchema } from 'graphql';


interface ApplyMiddlewareProps {
  middlewares: Middleware[];
  context: Context;
  config: Configuration;
  schema: GraphQLSchema;
  extensions: MiddlewareExtensions;
  request: Request;
}

interface ApplyMiddlewareResponse {
  context: Context;
  schema: GraphQLSchema;
  validationRules: ValidationRule[];
  extensions: MiddlewareExtensions;

}

type ApplyMiddleware = (props: ApplyMiddlewareProps) => MaybePromise<ApplyMiddlewareResponse>;

const applyMiddlewares: ApplyMiddleware = async (props) => {
  const { middlewares, config, context, schema, request, extensions } = props;


  // define validation rules and new context
  let composedValidationRules: ValidationRule[] = [];
  let composedContext: Context = context;
  let composedSchema: GraphQLSchema = schema;
  let composedExtensions: MiddlewareExtensions = extensions;

  await middlewares.reduce(async (prev, middleware) => {
    await prev;

    // init middleware
    const mdlwreData = await middleware({
      config,
      schema: composedSchema,
      context: composedContext,
      extensions: composedExtensions,
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
    composedContext = mdlwreData.context || composedContext;

    // replace schema
    composedSchema = mdlwreData.schema || composedSchema;

    // replace extensions
    composedExtensions = mdlwreData.extensions || composedExtensions;

  }, Promise.resolve())


  return {
    context: composedContext,
    validationRules: composedValidationRules,
    schema: composedSchema,
    extensions: composedExtensions,
  }
}

export default applyMiddlewares;
