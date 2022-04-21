import type {
  OutputFilter,
  BuildQueryFilter,
  SearchMultipleFields,
  SearchSingleField,
  Where,
} from '@via-profit-services/core';

import { getCursorPayload } from './cursors';

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

  // transform filter to where clause
  const where: Where = [];

  if (filter) {
    Object.entries(filter).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        where.push([field, 'in', value]);
      } else {
        where.push([field, '=', value]);
      }
    });
  }

  // combine filter
  const outputFilter: OutputFilter = {
    limit: 0,
    offset: 0,
    orderBy: [],
    where: [],
    search: false,
    between: {},
    revert: false,
  };

  // If passed the «first» argument, but not passed cursor
  // we must combine all passed arguments as is
  if (typeof first === 'number' && (typeof after === 'undefined' || after === null)) {
    outputFilter.offset = offset || 0;
    outputFilter.limit = first;
    outputFilter.where = where || [];
    outputFilter.orderBy = orderBy || [];
    outputFilter.between = between || {};
    outputFilter.revert = false;
  }

  // If passed the «first» argument with cursor
  // we must parse the cursor and merge arguments
  if (typeof first === 'number' && typeof after === 'string') {
    const cursorPayload = getCursorPayload(after);
    outputFilter.offset = cursorPayload.offset;
    outputFilter.limit = first;
    outputFilter.where = cursorPayload.where;
    outputFilter.orderBy = cursorPayload.orderBy;
    outputFilter.between = cursorPayload.between;
    outputFilter.revert = false;
  }

  // If passed the «last» argument, but not passed cursor
  // we must combine all passed arguments as is
  if (typeof last === 'number' && (typeof before === 'undefined' || before === null)) {
    outputFilter.offset = Math.max((offset || 0) - last, 0);
    outputFilter.limit = Math.min(last - 1, 0);
    outputFilter.where = where || [];
    outputFilter.orderBy = orderBy || [];
    outputFilter.between = between || {};
    outputFilter.revert = true;
  }

  // If passed the «last» argument with cursor
  // we must parse the cursor and merge arguments
  if (typeof last === 'number' && typeof before === 'string') {
    const cursorPayload = getCursorPayload(before);
    outputFilter.offset = Math.max(cursorPayload.offset - last, 0);
    outputFilter.limit = Math.min(last - 1, 0);
    outputFilter.where = cursorPayload.where;
    outputFilter.orderBy = cursorPayload.orderBy;
    outputFilter.between = cursorPayload.between;
    outputFilter.revert = true;
  }

  if (Array.isArray(search)) {
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
