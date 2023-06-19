# CHANGELOG

## `2.4.0` *xx xxxxxxxx xxxx`

### Breaking

 - `timezone` value in Context now is deprecated
 - `defaultOutputFilter` value now is deprecated
 - `stringToCursor` function now is deprecated
 - `cursorToString` function now is deprecated
 - `makeNodeCursor` function now is deprecated
 - `getCursorPayload` function now is deprecated
 - `buildCursorConnection` function now is deprecated
 - `nodeToEdge` function now is deprecated
 - `extractNodeField` function now is deprecated
 - `extractNodeIds` function now is deprecated
 - `arrayOfIdsToArrayOfObjectIds` function now is deprecated
 - `buildQueryFilter` function now is deprecated
 - `extractKeyAsObject` function now is deprecated
 - `fieldBuilder` function now is deprecated
 - `DEFAULT_SERVER_TIMEZONE` constant now is deprecated
 - `ListResponse` type now is deprecated

### Bugfixes

 - Fixed errors in `buildQueryFilter` function (`between` param).

### New features

 - `BigInt` scalar added named as `BigIntScalarType`
