import type { FieldBuilder } from '@via-profit-services/core';

/**
 * @deprecated Since version 2.4. Will be deleted in version 3.0.
 */
const fieldBuilder: FieldBuilder = (fields, resolverFactory) => {
  const ret: any = {};
  fields.forEach(field => {
    ret[field] = resolverFactory(field);
  });

  return ret;
};

export default fieldBuilder;
