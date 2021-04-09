
import { Context, MaybePromise } from '@via-profit-services/core';
import {
  GraphQLSchema, GraphQLFieldResolver, GraphQLResolveInfo,
  GraphQLField, GraphQLObjectType,
} from 'graphql';

const SYMBOL_PROCESSED: string = Symbol('processed') as any;

type Args = Record<string, unknown>;
type Source = unknown;
type MutatedField = GraphQLField<Source, Context, Args> & Record<string, boolean>;
type MutatedObjectType = GraphQLObjectType<Source, Context> & Record<string, boolean>;

type FieldResolver = (
  source: Source,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo,
) => GraphQLFieldResolver<Source, Context, Args>

// export type WrapperFunction = (props: {
//   resolver: FieldResolver;
//   source: Source;
//   args: Args;
//   context: Context;
//   info: GraphQLResolveInfo;
// }) => MaybePromise<FieldResolver>;
export type WrapperFunction = (props: {
  resolver: FieldResolver;
  source: Source;
  args: Args;
  context: Context;
  info: GraphQLResolveInfo;
}) => MaybePromise<{
  resolver?: FieldResolver;
  source?: Source;
  args?: Args;
  context?: Context;
  info?: GraphQLResolveInfo;
}>;

// __TypeKind, __InputValue, ...
export const isSystemType = (fieldName: string): boolean => /^__/.test(fieldName)


const visitType = (
  type: MutatedObjectType,
  wrapper: WrapperFunction,
) => {
  if (type[SYMBOL_PROCESSED] || !type.getFields || isSystemType(type.toString())) {
    return;
  }

  const fields = type.getFields();
  for (const fieldName in fields) {
    if (!Object.hasOwnProperty.call(fields, fieldName)) {
      continue;
    }

    wrapField(fields[fieldName] as MutatedField, wrapper);
  }
}


const wrapField = (
  field: MutatedField,
  wrapper: WrapperFunction,
) => {
  const resolver = field.resolve;

  if (field[SYMBOL_PROCESSED] || !resolver) {
    return;
  }

  field[SYMBOL_PROCESSED] = true;
  // field.resolve = (source, args, context, info) => wrapper({
  //   resolver,
  //   source,
  //   args,
  //   context,
  //   info,
  // })
  // const wr = 


  field.resolve = async (source, args, context, info) => {
    // (context as any).foo = 'the foo'
    const res = await wrapper({ resolver, source, args, context, info });
    const mutatedSource = res.source || source;
    const mutatedArgs = res.args || args;
    const mutatedContext = res.context || context;
    const mutatedInfo = res.info || info;
    const mutatedResolver = res.resolver || resolver;

    return mutatedResolver(mutatedSource, mutatedArgs, mutatedContext, mutatedInfo);
  }
}

const visitSchema = (
  schema: GraphQLSchema,
  wrapper: WrapperFunction,
  ) => {
  const types = schema.getTypeMap();
  for (const typeName in types) {
    if (!Object.hasOwnProperty.call(types, typeName)) {
      continue;
    }

    visitType(types[typeName] as MutatedObjectType, wrapper);
  }
}


const wrapResolvers = (
  schema: GraphQLSchema,
  wrapper: WrapperFunction,
) => {
  visitSchema(schema, wrapper);

  return schema;
}

export default wrapResolvers;
