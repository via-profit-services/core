import type {
  NodeToEdge, ExtractNodeField, ExtractNodeIds, CollateForDataloader, ArrayOfIdsToArrayOfObjectIds,
  WithKey, ExtractKeyAsObject,
} from '@via-profit-services/core';

import { makeNodeCursor } from './cursors';


/**
 * Wrap node to cursor object
 */
export const nodeToEdge: NodeToEdge = (node, cursorName, cursorPayload) => ({
  node,
  cursor: makeNodeCursor(cursorName, cursorPayload),
});

/**
 * Return array of fields of node
 */
export const extractNodeField: ExtractNodeField = (nodes, field) => [...nodes]
  .map((node) => node[field]);


/**
 * Returns node IDs array
 */
export const extractNodeIds: ExtractNodeIds = (nodes) => extractNodeField(nodes, 'id');


/**
 * Collate rows for dataloader response
 */
export const collateForDataloader: CollateForDataloader = (
  ids,
  nodes,
  returnUndefined,
) => ids.map((id) => nodes.find((node) => node.id === id) || (returnUndefined ? undefined : null));


/**
 * Format array of IDs to object with id key
 */
export const arrayOfIdsToArrayOfObjectIds: ArrayOfIdsToArrayOfObjectIds = (array) => array.length
    ? array.map((id) => ({ id }))
    : null;


export const extractKeyAsObject: ExtractKeyAsObject = (
  source,
  key,
  defaultValue,
  ) => ({
    [key]: source[key] || defaultValue,
  } as WithKey<typeof key, typeof source[typeof key]>)
