
import type { MutatedField, MutatedObjectType, ResolversWrapper, NoopResolver } from '@via-profit-services/core';
import { isIntrospectionType, isObjectType } from 'graphql';

const resolversWrapper: ResolversWrapper = (schema, wrapperFunction) => {
  const SYMBOL_PROCESSED: string = Symbol('processed') as any;
  const types = schema.getTypeMap();
  const noopResolve: NoopResolver = async (parent, _args, _context, info) => {
    const { fieldName } = info;

    return parent ? parent[fieldName] : undefined;
  }

  Object.entries(types).forEach(([_typeName, type]) => {
    if (isIntrospectionType(type)
    || !isObjectType(type)
    || (type as MutatedObjectType)[SYMBOL_PROCESSED]
    ) {
      return;
    }

    const fields = type.getFields();

    Object.entries(fields).forEach(([_fieldName, field]) => {
      // check to affected field
      if ((field as MutatedField)[SYMBOL_PROCESSED]) {
        return;
      }

      const { resolve } = field;

      // mutate original resolver
      field.resolve = async (source, args, context, info) => {
        const res = await wrapperFunction({
          resolve: resolve || noopResolve,
          source,
          args,
          context,
          info,
        });
        const mutatedSource = res.source || source;
        const mutatedArgs = res.args || args;
        const mutatedContext = res.context || context;
        const mutatedInfo = res.info || info;
        const mutatedResolver = res.resolve || resolve;

        return mutatedResolver(mutatedSource, mutatedArgs, mutatedContext, mutatedInfo);
      }

      // mark field as affected
      (field as MutatedField)[SYMBOL_PROCESSED] = true;
    });

    // mark type as affected
    (type as MutatedObjectType)[SYMBOL_PROCESSED] = true;
  });

  return schema;
}

export default resolversWrapper;
