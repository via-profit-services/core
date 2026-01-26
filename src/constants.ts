export const DEFAULT_PERSISTED_QUERY_KEY = 'documentId';

export const DEFAULT_MAX_FIELD_SIZE = 16 * 1024 * 1024; // 16MB per field
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
export const DEFAULT_MAX_FILES = 20;
export const DEFAULT_MAX_FILE_FIELDS = 2;
export const DEFAULT_MAX_FILE_PARTS = 20;
export const DEFAULT_MAX_FILE_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB total
export const DEFAULT_JSON_MAX_BYTES = 1 * 1024 * 1024; // 1MB JSON body

// GraphQL depth limits
export const DEFAULT_MAX_GRAPHQL_DEPTH_LIMIT = 10;
export const DEFAULT_MAX_GRAPHQL_INTROSPECTION_DEPTH_LIMIT = 10;

// GraphQL complexity limits
export const DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIMIT = 5000;
export const DEFAULT_MAX_GRAPHQL_COMPLEXITY_FIELD_COST = 1;

// Additional recommended defaults for extended complexity options
export const DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIST_ARGUMENTS = [
  'first',
  'limit',
  'take',
  'pageSize',
  'size',
];

export const DEFAULT_MAX_GRAPHQL_COMPLEXITY_DEFAULT_LIST_MULTIPLIER = 1;
// 1 = disabled; set to e.g. 10 if you want list fields to be expensive by default

export const DEFAULT_MAX_GRAPHQL_COMPLEXITY_INTROSPECTION_COST = 2;
// introspection fields are slightly more expensive

export const DEFAULT_MAX_GRAPHQL_COMPLEXITY_MAX_FIELDS_PER_SELECTION = 50;
// undefined = no limit; set to e.g. 50 to prevent extremely wide queries
