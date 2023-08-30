import type {
  NodeToEdge,
  ExtractNodeField,
  ExtractNodeIds,
  ArrayOfIdsToArrayOfObjectIds,
  WithKey,
  ExtractKeyAsObject,
} from '@via-profit-services/core';

import { makeNodeCursor } from './cursors';

/**
 * Wrap node to cursor object
 * @deprecated Since version 2.4. Will be deleted in version 3.0.
 */
export const nodeToEdge: NodeToEdge = (node, cursorName, cursorPayload) => ({
  node,
  cursor: makeNodeCursor(cursorName, cursorPayload),
});

/**
 * Return array of fields of node
 * @deprecated Since version 2.4. Will be deleted in version 3.0.
 */
export const extractNodeField: ExtractNodeField = (nodes, field) =>
  [...nodes].map(node => node[field]);

/**
 * Returns node IDs array
 * @deprecated Since version 2.4. Will be deleted in version 3.0.
 */
export const extractNodeIds: ExtractNodeIds = nodes => extractNodeField(nodes, 'id');

/**
 * Format array of IDs to object with id key
 * @deprecated Since version 2.4. Will be deleted in version 3.0.
 */
export const arrayOfIdsToArrayOfObjectIds: ArrayOfIdsToArrayOfObjectIds = array =>
  array.length ? array.map(id => ({ id })) : null;

/**
 * @deprecated Since version 2.4. Will be deleted in version 3.0.
 */
export const extractKeyAsObject: ExtractKeyAsObject = (source, key, defaultValue) =>
  ({
    [key]: source[key] || defaultValue,
  }) as WithKey<typeof key, (typeof source)[typeof key]>;
