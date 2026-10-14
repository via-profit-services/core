import type {
  GraphQLField,
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
} from 'graphql';

import type { Context } from '../application/types';
import type { MaybePromise } from '../utils/types';

export interface BetweenDate {
  start: Date;
  end: Date;
}
export interface BetweenTime {
  start: string;
  end: string;
}
export interface BetweenDateTime {
  start: Date;
  end: Date;
}
export interface BetweenInt {
  start: number;
  end: number;
}
export interface BetweenMoney {
  start: bigint;
  end: bigint;
}
export interface Between {
  [key: string]: BetweenDate | BetweenTime | BetweenDateTime | BetweenInt | BetweenMoney;
}

export type Source = any;

type Args = Record<string, unknown>;
export type MutatedField = GraphQLField<Source, Context, Args> & Record<string, boolean>;
export type MutatedObjectType = GraphQLObjectType<Source, Context> & Record<string, boolean>;

export type ResolversWrapperFunction = (props: {
  resolve: GraphQLFieldResolver<Source, Context, Args>;
  source: Source;
  args: Args;
  context: Context;
  info: GraphQLResolveInfo;
}) => MaybePromise<{
  resolve?: GraphQLFieldResolver<Source, Context, Args>;
  source?: Source;
  args?: Args;
  context?: Context;
  info?: GraphQLResolveInfo;
}>;

export type NoopResolver = GraphQLFieldResolver<Source, Context, Args>;

export type FieldsWrapper = (
  schema: GraphQLSchema,
  wrapper: ResolversWrapperFunction,
  options?: {
    wrapWithoutResolvers?: boolean;
  },
) => GraphQLSchema;

export type ResolverFactory<
  Data extends Record<string, any> = any,
  Source extends Record<string, any> = any,
  Args extends Record<string, any> = any,
> = (field: keyof Data) => GraphQLFieldResolver<Source, Context, Args>;
