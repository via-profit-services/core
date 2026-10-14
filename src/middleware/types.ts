import type http from 'node:http';
import type { GraphQLErrorExtensions, GraphQLSchema, ValidationRule } from 'graphql';

import type { Configuration, Context, CoreStats } from '../application/types';
import type { MaybePromise } from '../utils/types';

/**
 * Execute each middleware
 */
export type ApplyMiddlewares = (props: {
  middlewares: Middleware[];
  request: http.IncomingMessage;
  stats: CoreStats;
  schema: GraphQLSchema;
  context: Context;
  extensions: GraphQLErrorExtensions;
  config: Configuration;
  validationRule: ValidationRule[];
}) => Promise<void>;

export interface MiddlewareProps {
  readonly config: Configuration;
  readonly stats: CoreStats;
  context: Context;
  validationRule: ValidationRule[];
  request: http.IncomingMessage;
  schema: GraphQLSchema;
  extensions: MiddlewareExtensions;
}

export interface MiddlewareExtensions {
  [key: string]: any;
}

export type Middleware = (props: MiddlewareProps) => MaybePromise<void>;
