export const DEFAULT_PERSISTED_QUERY_KEY = 'documentId';

// Non-file multipart fields (operations, map) are held in memory:
// keep the limit equal to the JSON body limit
export const DEFAULT_MAX_FIELD_SIZE = 1 * 1024 * 1024; // 1MB per field
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
export const DEFAULT_MAX_FILES = 20;
export const DEFAULT_MAX_FILE_FIELDS = 6;
// must allow all files and all fields at once
export const DEFAULT_MAX_FILE_PARTS = DEFAULT_MAX_FILES + DEFAULT_MAX_FILE_FIELDS;
export const DEFAULT_MAX_FILE_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB total
export const DEFAULT_JSON_MAX_BYTES = 1 * 1024 * 1024; // 1MB JSON body
export const DEFAULT_JSON_DECOMPRESSED_MAX_BYTES = 5 * 1024 * 1024; // 5MB JSON body decompressed

// GraphQL depth limits
// Fragments do not add a level. The deepest operation of the biotransfer
// clients (CRM, driver and client apps, 443 operations) has depth 10;
// all projects (biotransfer, prime, commerce, crm) use 20 in production.
export const DEFAULT_MAX_GRAPHQL_DEPTH_LIMIT = 20;
// the standard introspection query (GraphiQL, codegen) has depth 14
export const DEFAULT_MAX_GRAPHQL_INTROSPECTION_DEPTH_LIMIT = 20;
// Max number of tokens in a GraphQL document. The parser stops early on
// huge documents (a 1 MB body may contain ~250 000 tokens).
// A large real-world query has a few thousand tokens.
export const DEFAULT_MAX_GRAPHQL_TOKENS = 10_000;

// Headers accepted as a proof that a request is not a CSRF (see csrfPrevention).
// A browser cannot add custom headers to a cross-origin request without a
// CORS preflight, and the preflight is controlled by the server.
export const CSRF_PREVENTION_HEADERS = [
  'x-requested-with',
  'apollo-require-preflight',
  'x-apollo-operation-name',
  'graphql-preflight',
];

// GraphQL complexity limits
// Complexity is close to the number of values in the response: every field
// costs 1 and is multiplied by the list size (`first: 30` → x30).
// Real biotransfer operations with real page sizes: median 25, the heaviest
// ones 13 000 (CRM working hours dialog, first: 10) and 41 000 (driver
// shift history with every page size set to 30). 50 000 covers them and rejects
// `items(first: 1000) { items(first: 1000) { id } }` (2 001 000).
export const DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIMIT = 50_000;
export const DEFAULT_MAX_GRAPHQL_COMPLEXITY_FIELD_COST = 1;

// Additional recommended defaults for extended complexity options
export const DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIST_ARGUMENTS = [
  'first',
  'last',
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
