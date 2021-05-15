
import type { MutatedField, MutatedObjectType, ResolversWrapper } from '@via-profit-services/core';

const resolversWrapper: ResolversWrapper = (schema, wrapperFunction) => {
  const SYMBOL_PROCESSED: string = Symbol('processed') as any;
  const types = schema.getTypeMap();

  // visit all types
  for (const typeName in types) {
    if (!Object.hasOwnProperty.call(types, typeName)) {
      continue;
    }

    const type = types[typeName] as MutatedObjectType;

    // check to affected type, type without fields and the system type
    if (type[SYMBOL_PROCESSED] || !type.getFields || /^__/.test(type.toString())) {
      continue;
    }

    const fields = type.getFields();

    // visit all fields of type
    for (const fieldName in fields) {
      if (!Object.hasOwnProperty.call(fields, fieldName)) {
        continue;
      }

      const field = fields[fieldName] as MutatedField
      const resolver = field.resolve;

      // check to affected field or field without resolver
      if (field[SYMBOL_PROCESSED] || !resolver) {
        continue;
      }

      // mutate original resolver
      field.resolve = async (source, args, context, info) => {
        const res = await wrapperFunction({ resolver, source, args, context, info });
        const mutatedSource = res.source || source;
        const mutatedArgs = res.args || args;
        const mutatedContext = res.context || context;
        const mutatedInfo = res.info || info;
        const mutatedResolver = res.resolver || resolver;

        return mutatedResolver(mutatedSource, mutatedArgs, mutatedContext, mutatedInfo);
      }

      // mark field as affected
      field[SYMBOL_PROCESSED] = true;
    }

    // mark type as affected
    type[SYMBOL_PROCESSED] = true;
  }

  return schema;
}

export default resolversWrapper;
