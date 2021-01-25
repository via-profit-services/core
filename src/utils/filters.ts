import type { OutputFilter, OutputSearch, ApplyAliases, WhereField, BuildQueryFilter } from '@via-profit-services/core';

import { DEFAULT_NODES_LIMIT } from '../constants';
import { getCursorPayload } from './cursors';

/**
 * @deprecated Use `ApplyAliases` function of `@via-profit-services/knex` instead
 */
export const applyAliases: ApplyAliases = (whereClause, aliases) => {
  const aliasesMap = new Map<string, string>();
  Object.entries(aliases).forEach(([tableName, field]) => {
    const fieldsArray = Array.isArray(field) ? field : [field];
    fieldsArray.forEach((fieldName) => {
      aliasesMap.set(fieldName, tableName);
    });
  });

  const newWhere = whereClause.map((data) => {
    const [field, action, value] = data;
    const alias = aliasesMap.get(field) || aliasesMap.get('*');

    const whereField: WhereField = [
      alias ? `${alias}.${field}` : field,
      action,
      value,
    ];

    return whereField;
  });

  return newWhere;
};


export const buildQueryFilter: BuildQueryFilter = (args) => {
  const {
    first, last, after, before, offset, orderBy, filter, search, between,
  } = args;


  // combine filter
  const outputFilter: OutputFilter = {
    limit: Math.max(Number(first || last) || DEFAULT_NODES_LIMIT, 0),
    orderBy: orderBy || [],
    revert: !!last,
    where: [],
    search: false,
    offset: Math.max(Number(offset) || 0, 0),
    between: between || {},
  };


  // if cursor was provied in after or before property
  if (after || before) {
    const cursorPayload = getCursorPayload(after || before);

    return {
      ...outputFilter,
      ...cursorPayload,
    };
  }

  // compile filter
  if (typeof filter !== 'undefined') {
    // if filter is an array
    if (Array.isArray(filter)) {
      outputFilter.where = filter;
    }

    if (!Array.isArray(filter)) {
      Object.entries(filter).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          outputFilter.where.push([ field, 'in', value ]);
        } else {
          outputFilter.where.push([ field, '=', value ]);
        }
      });
    }
  }


  // if search is an array of single field
  if (search && Array.isArray(search)) {
    outputFilter.search = search as OutputSearch;
  }

  // if search is a object with simgle field
  if (search && 'field' in search) {
    outputFilter.search = [search];
  }

  // if search is object with multiple fields
  if (search && 'fields' in search && Array.isArray(search.fields)) {
    outputFilter.search = search.fields.map((field) => ({
      field,
      query: search.query,
    }));
  }


  return outputFilter;
};

