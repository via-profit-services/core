import type {
  ValidationRule,
  ValidationContext,
  OperationDefinitionNode,
  SelectionNode,
  FragmentDefinitionNode,
} from 'graphql';
import { GraphQLError, Kind } from 'graphql';

/**
 * Options for controlling GraphQL query depth validation.
 *
 * maxDepth:
 *   Maximum allowed nesting depth for regular GraphQL fields.
 *
 * maxIntrospectionDepth:
 *   Maximum allowed nesting depth for introspection fields (e.g. __schema, __type).
 *   Defaults to maxDepth if not provided.
 */
export interface DepthLimitOptions {
  maxDepth: number;
  maxIntrospectionDepth?: number;
}

/**
 * Internal state passed through recursive depth checks.
 *
 * depth:
 *   Current depth of the query (non-introspection fields).
 *
 * introspectionDepth:
 *   Current depth for introspection fields. These are tracked separately because
 *   introspection queries can be significantly more expensive.
 *
 * isIntrospection:
 *   Indicates whether the current traversal path is inside an introspection subtree.
 *
 * visitedFragments:
 *   Tracks fragment names to prevent infinite recursion in cyclic fragment spreads.
 *
 * report:
 *   Helper function for reporting validation errors through GraphQL's context.
 */
type CheckState = {
  depth: number;
  introspectionDepth: number;
  isIntrospection: boolean;
  visitedFragments: string[];
  report: (msg: string) => void;
};

/**
 * Creates a GraphQL validation rule that enforces maximum query depth.
 *
 * This rule:
 *   - Traverses the AST recursively.
 *   - Increments depth only when entering a selectionSet.
 *   - Handles inline fragments and fragment spreads.
 *   - Detects introspection fields and applies separate depth limits.
 *   - Prevents infinite recursion caused by cyclic fragment references.
 *
 * This implementation is intentionally minimal and predictable, avoiding
 * complexity found in some third‑party depth‑limit libraries.
 */
export default function depthLimit(options: DepthLimitOptions): ValidationRule {
  const { maxDepth, maxIntrospectionDepth = maxDepth } = options;

  /**
   * Cache of fragment definitions for quick lookup during traversal.
   * Populated once per operation.
   */
  const fragmentCache = new Map<string, FragmentDefinitionNode>();

  return function DepthLimitRule(context: ValidationContext) {
    return {
      /**
       * Entry point for depth validation.
       * Triggered once per operation definition.
       */
      OperationDefinition(node: OperationDefinitionNode) {
        // Collect all fragment definitions from the document.
        // This avoids repeated scanning during recursive traversal.
        const doc = context.getDocument();
        for (const def of doc.definitions) {
          if (def.kind === Kind.FRAGMENT_DEFINITION) {
            fragmentCache.set(def.name.value, def);
          }
        }

        // Begin recursive depth analysis starting from the operation root.
        checkSelectionSetDepth(node.selectionSet.selections, {
          depth: 0,
          introspectionDepth: 0,
          isIntrospection: false,
          visitedFragments: [],
          report: msg =>
            context.reportError(
              new GraphQLError(`'${node.name?.value ?? '(anonymous)'}' ${msg}`, [node]),
            ),
        });
      },
    };
  };

  /**
   * Recursively checks the depth of a selection set.
   *
   * This function handles:
   *   - Field nodes
   *   - Inline fragments
   *   - Fragment spreads
   *
   * Depth increases only when entering a selectionSet, not for scalar fields.
   */
  function checkSelectionSetDepth(selections: readonly SelectionNode[], state: CheckState): void {
    for (const selection of selections) {
      switch (selection.kind) {
        /**
         * FIELD
         * Represents a single field in the query.
         */
        case Kind.FIELD: {
          // Detect introspection fields (e.g. __schema, __type).
          // Once inside introspection, all nested fields are treated as introspection.
          const isIntroField = selection.name.value.startsWith('__') || state.isIntrospection;

          // Increase depth only if the field has a selectionSet (i.e. is not scalar).
          const nextDepth = selection.selectionSet ? state.depth + 1 : state.depth;

          // Introspection depth is tracked separately.
          const nextIntroDepth =
            isIntroField && selection.selectionSet
              ? state.introspectionDepth + 1
              : state.introspectionDepth;

          // Enforce depth limits.
          if (nextDepth > maxDepth) {
            state.report(`The query is too deeply nested. Maximum allowed depth is ${maxDepth}.`);
            return;
          }

          if (nextIntroDepth > maxIntrospectionDepth) {
            state.report(
              `The introspection query is too deeply nested. Maximum allowed depth is ${maxIntrospectionDepth}.`,
            );
            return;
          }

          // Recurse into nested selection sets.
          if (selection.selectionSet) {
            checkSelectionSetDepth(selection.selectionSet.selections, {
              ...state,
              depth: nextDepth,
              introspectionDepth: nextIntroDepth,
              isIntrospection: isIntroField,
            });
          }

          break;
        }

        /**
         * INLINE_FRAGMENT
         * Represents an inline fragment: ... on Type { ... }
         */
        case Kind.INLINE_FRAGMENT: {
          const nextDepth = selection.selectionSet ? state.depth + 1 : state.depth;

          if (nextDepth > maxDepth) {
            state.report(`The query is too deeply nested. Maximum allowed depth is ${maxDepth}.`);
            return;
          }

          checkSelectionSetDepth(selection.selectionSet.selections, {
            ...state,
            depth: nextDepth,
          });

          break;
        }

        /**
         * FRAGMENT_SPREAD
         * Represents a reference to a named fragment: ...UserFields
         */
        case Kind.FRAGMENT_SPREAD: {
          const name = selection.name.value;

          // Prevent infinite recursion in cyclic fragments.
          if (state.visitedFragments.includes(name)) {
            // Cyclic fragments are handled by other validation rules.
            break;
          }

          const fragment = fragmentCache.get(name);
          if (!fragment) {
            // Missing fragments are handled by GraphQL's built‑in validation.
            break;
          }

          const nextDepth = fragment.selectionSet ? state.depth + 1 : state.depth;

          if (nextDepth > maxDepth) {
            state.report(`The query is too deeply nested. Maximum allowed depth is ${maxDepth}.`);
            return;
          }

          // Recurse into the fragment's selection set.
          checkSelectionSetDepth(fragment.selectionSet.selections, {
            ...state,
            depth: nextDepth,
            visitedFragments: [...state.visitedFragments, name],
          });

          break;
        }
      }
    }
  }
}
