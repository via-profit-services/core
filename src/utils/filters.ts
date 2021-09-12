import type {
  OutputFilter,
  ApplyAliases,
  WhereField,
  BuildQueryFilter,
  SearchMultipleFields,
  SearchSingleField,
} from '@via-profit-services/core';

import { DEFAULT_NODES_LIMIT } from '../constants';
import { getCursorPayload } from './cursors';

/**
 * @deprecated Use `ApplyAliases` function of `@via-profit-services/knex` instead
 */
export const applyAliases: ApplyAliases = (whereClause, aliases) => {
  const aliasesMap = new Map<string, string>();
  Object.entries(aliases).forEach(([tableName, field]) => {
    const fieldsArray = Array.isArray(field) ? field : [field];
    fieldsArray.forEach(fieldName => {
      aliasesMap.set(fieldName, tableName);
    });
  });

  const newWhere = whereClause.map(data => {
    const [field, action, value] = data;
    const alias = aliasesMap.get(field) || aliasesMap.get('*');

    const whereField: WhereField = [alias ? `${alias}.${field}` : field, action, value];

    return whereField;
  });

  return newWhere;
};

export const defaultOutputFilter: OutputFilter = {
  limit: 0,
  offset: 0,
  orderBy: [],
  where: [],
  between: {},
  revert: false,
  search: false,
};

export const buildQueryFilter: BuildQueryFilter = args => {
  const { first, last, after, before, offset, orderBy, filter, search, between } = args;

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
  if (typeof filter !== 'undefined' && filter !== null) {
    // if filter is an array
    if (Array.isArray(filter)) {
      outputFilter.where = filter;
    }

    if (!Array.isArray(filter)) {
      Object.entries(filter).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          outputFilter.where.push([field, 'in', value]);
        } else {
          outputFilter.where.push([field, '=', value]);
        }
      });
    }
  }

  if (search && Array.isArray(search)) {
    search.forEach((s: SearchMultipleFields | SearchSingleField) => {
      // is is search single fiels
      if ('field' in s) {
        outputFilter.search = outputFilter.search || [];
        outputFilter.search.push({
          field: s.field,
          query: s.query,
        });
      }

      // is is search multiple fiels
      if ('fields' in s && Array.isArray(s.fields)) {
        [...(s.fields || [])].forEach(field => {
          outputFilter.search = outputFilter.search || [];
          outputFilter.search.push({
            field,
            query: s.query,
          });
        });
      }
    });
  }

  // if search is a object with simgle field
  if (search && 'field' in search) {
    outputFilter.search = [search];
  }

  // if search is object with multiple fields
  if (search && 'fields' in search && Array.isArray(search.fields)) {
    outputFilter.search = search.fields.map(field => ({
      field,
      query: search.query,
    }));
  }

  // between
  Object.entries(outputFilter.between).forEach(([betweenField, data]) => {
    if (data.start && data.start instanceof Date && data.end && data.end instanceof Date) {
      const startDateTimeSum =
        data.start.getUTCHours() + data.start.getUTCMinutes() + data.start.getUTCSeconds();
      const endDateTimeSum =
        data.end.getUTCHours() + data.end.getUTCMinutes() + data.end.getUTCSeconds();

      if (endDateTimeSum === 0 && startDateTimeSum === endDateTimeSum) {
        (outputFilter.between[betweenField].end as Date).setSeconds(59);
        (outputFilter.between[betweenField].end as Date).setMinutes(59);
        (outputFilter.between[betweenField].end as Date).setHours(23);
      }
    }
  });

  return outputFilter;
};
