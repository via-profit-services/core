# CHANGELOG

# `2.7.0` 13.12.2024`

### Breaking

 - The `Money` scalar type now is `bigint` value, not a `number`

# `2.6.0` 02.11.2024`

### Breaking

- The `Context` property now is empty object

## `2.5.0` 08.08.2024`

### Updates

Graphql was updated to `16.9.0`.

- The method `makeGraphQLRequest` in the class `CoreService` is now static
- The method `getVersion` in the class `CoreService` is now static

### Breaking

- input type `BetweenDate` now is removed. Use `BetweenDateTime` instead
- scalar type `Date` now is removed. Use `DateTime` instead
- `timezone` value in Context now is removed
- `defaultOutputFilter` value now is removed
- `stringToCursor` function now is removed
- `cursorToString` function now is removed
- `makeNodeCursor` function now is removed
- `getCursorPayload` function now is removed
- `buildCursorConnection` function now is removed
- `nodeToEdge` function now is removed
- `extractNodeField` function now is removed
- `extractNodeIds` function now is removed
- `arrayOfIdsToArrayOfObjectIds` function now is removed
- `buildQueryFilter` function now is removed
- `extractKeyAsObject` function now is removed
- `fieldBuilder` function now is removed
- `DEFAULT_SERVER_TIMEZONE` constant now is removed
- `ListResponse` type now is removed

## `2.4.0` 30.08.2023`

### Breaking

- `timezone` value in Context now is removed
- `defaultOutputFilter` value now is removed
- `stringToCursor` function now is removed
- `cursorToString` function now is removed
- `makeNodeCursor` function now is removed
- `getCursorPayload` function now is removed
- `buildCursorConnection` function now is removed
- `nodeToEdge` function now is removed
- `extractNodeField` function now is removed
- `extractNodeIds` function now is removed
- `arrayOfIdsToArrayOfObjectIds` function now is removed
- `buildQueryFilter` function now is removed
- `extractKeyAsObject` function now is removed
- `fieldBuilder` function now is removed
- `DEFAULT_SERVER_TIMEZONE` constant now is removed
- `ListResponse` type now is removed

### Bugfixes

- Fixed errors in `buildQueryFilter` function (`between` param).

### New features

- `BigInt` scalar added named as `BigIntScalarType`
