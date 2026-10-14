import {
  parse,
  validate,
  Source,
  GraphQLError,
  Lexer,
  TokenKind,
  type GraphQLSchema,
  type ValidationRule,
  type DocumentNode,
} from 'graphql';

import ServerError from '../errors/server-error';
import { LRUCache } from '../utils/lru-cache';

/**
 * Bounded by the number of documents and by the total length of their source
 * text: an AST takes roughly 10-20 times more memory than its source.
 */
const DOCUMENT_CACHE_MAX_ENTRIES = 1000;
const DOCUMENT_CACHE_MAX_TOTAL_LENGTH = 2 * 1024 * 1024;

export type CachedDocument = {
  readonly document: DocumentNode;
  readonly errors: readonly GraphQLError[];
  /** Number of tokens, counted only when the usage of the limits is measured */
  readonly tokens?: number;
};

type DocumentCacheOptions = {
  readonly schema: GraphQLSchema;
  /** Request-independent rules: their result depends only on the text */
  readonly rules: readonly ValidationRule[];
  readonly maxTokens?: number;
  /** Count the tokens of every new document (see LimitsUsage) */
  readonly countTokens: boolean;
};

/**
 * Number of tokens of a document, as the parser counts them for maxTokens.
 * One more pass of the lexer: done only on a cache miss and only when the
 * usage is measured.
 */
const countTokens = (source: Source): number => {
  const lexer = new Lexer(source);
  let count = 0;
  while (lexer.advance().kind !== TokenKind.EOF) {
    count += 1;
  }

  return count;
};

/**
 * Parsed documents validated with the standard rules.
 *
 * Clients send the same query texts again and again, and the result of
 * parse() + validate() with request-independent rules depends only on the
 * text, so it is cached.
 */
export class DocumentCache {
  private readonly cache = new LRUCache<string, CachedDocument>(
    DOCUMENT_CACHE_MAX_ENTRIES,
    DOCUMENT_CACHE_MAX_TOTAL_LENGTH,
  );

  constructor(private readonly options: DocumentCacheOptions) {}

  /**
   * The document of the query and whether it was taken from the cache.
   * Throws a ServerError if the query can not be parsed. Validation errors
   * are returned (and cached) with the document.
   */
  load(query: string): { readonly entry: CachedDocument; readonly hit: boolean } {
    const cached = this.cache.get(query);
    if (cached) {
      return { entry: cached, hit: true };
    }

    const { schema, rules, maxTokens } = this.options;
    const source = new Source(query, 'GraphQL request');
    let document: DocumentNode;
    try {
      // maxTokens stops the parser early on huge documents
      document = parse(source, { maxTokens });
    } catch (err) {
      throw new ServerError(
        [err instanceof GraphQLError ? err : new GraphQLError(String(err))],
        'graphql-error-validate-request',
      );
    }

    const entry: CachedDocument = {
      document,
      errors: validate(schema, document, rules),
      tokens: this.options.countTokens ? countTokens(source) : undefined,
    };
    this.cache.set(query, entry, query.length);

    return { entry, hit: false };
  }
}
