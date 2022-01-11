import type { FieldBuilder } from '@via-profit-services/core';

const fieldBuilder: FieldBuilder = (fields, resolverFactory) => {
  const ret: any = {};
  fields.forEach(field => {
    ret[field] = resolverFactory(field);
  });

  return ret;
};

export default fieldBuilder;