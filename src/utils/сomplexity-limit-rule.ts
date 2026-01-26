import {
  GraphQLError,
  Kind,
  type ValidationRule,
  type ValidationContext,
  type SelectionNode,
  type FragmentDefinitionNode,
} from 'graphql';

/**
 * Options for configuring the complexity‑limit validation rule.
 *
 * maxComplexity:
 *   The maximum allowed total complexity for a GraphQL operation.
 *   If the calculated complexity exceeds this value, the query is rejected.
 *
 * fieldCost:
 *   Base cost assigned to every field. This cost is added before applying
 *   list multipliers or child complexity. Default: 1.
 *
 * listArguments:
 *   Argument names that represent list size or pagination limits.
 *   If a field contains one of these arguments, its complexity is multiplied
 *   by the argument value. Example: users(first: 50) → multiplier = 50.
 */
export interface ComplexityLimitOptions {
  maxComplexity: number;
  fieldCost?: number;
  listArguments?: string[];
}

/**
 * Internal state passed through recursive complexity calculations.
 *
 * complexity:
 *   Not used for incremental accumulation. Instead, each recursive call
 *   returns its own complexity value. This field is kept for potential
 *   debugging or future extensions.
 *
 * visitedFragments:
 *   Tracks fragment names to prevent infinite recursion caused by cyclic
 *   fragment spreads. GraphQL allows recursive fragments, so we must guard
 *   against them manually.
 *
 * report:
 *   Helper function for reporting validation errors through GraphQL's
 *   ValidationContext. Ensures consistent error formatting.
 */
type CheckState = {
  complexity: number;
  visitedFragments: string[];
  report: (msg: string) => void;
};

/**
 * Creates a GraphQL validation rule that calculates the total complexity
 * of a query and rejects it if it exceeds the configured limit.
 *
 * Complexity is calculated using a multiplicative model:
 *
 *   fieldComplexity = (fieldCost + childComplexity) * listMultiplier
 *
 * This model reflects real server load more accurately than a simple
 * additive approach, especially for nested lists.
 */
export default function complexityLimit(options: ComplexityLimitOptions): ValidationRule {
  const {
    maxComplexity,
    fieldCost = 1,
    listArguments = ['first', 'limit', 'take', 'pageSize', 'size'],
  } = options;

  /**
   * Cache of fragment definitions for quick lookup.
   * Populated once per operation to avoid repeated scanning.
   */
  const fragmentCache = new Map<string, FragmentDefinitionNode>();

  return function ComplexityLimitRule(context: ValidationContext) {
    return {
      /**
       * Entry point for complexity validation.
       * Triggered once per operation definition.
       */
      OperationDefinition(node) {
        // Collect all fragment definitions from the document.
        const doc = context.getDocument();
        for (const def of doc.definitions) {
          if (def.kind === Kind.FRAGMENT_DEFINITION) {
            fragmentCache.set(def.name.value, def);
          }
        }

        const state: CheckState = {
          complexity: 0,
          visitedFragments: [],
          report: msg =>
            context.reportError(
              new GraphQLError(`'${node.name?.value ?? '(anonymous)'}' ${msg}`, [node]),
            ),
        };

        // Calculate total complexity for the operation.
        const complexity = calculateSelections(node.selectionSet.selections, state);

        // Reject the query if it exceeds the configured limit.
        if (complexity > maxComplexity) {
          state.report(
            `Query complexity ${complexity} exceeds the maximum allowed complexity of ${maxComplexity}.`,
          );
        }
      },
    };
  };

  /**
   * Recursively calculates the complexity of a selection set.
   *
   * This function:
   *   - Computes field complexity using the multiplicative model.
   *   - Handles inline fragments and fragment spreads.
   *   - Prevents infinite recursion via visitedFragments.
   *   - Returns the total complexity for the current selection set.
   */
  function calculateSelections(selections: readonly SelectionNode[], state: CheckState): number {
    let total = 0;

    for (const selection of selections) {
      switch (selection.kind) {
        /**
         * FIELD
         * Represents a single field in the query.
         */
        case Kind.FIELD: {
          // Base cost for the field.
          const cost = fieldCost;

          // Multiplier for list fields (e.g., first: 50).
          let multiplier = 1;

          if (selection.arguments?.length) {
            for (const arg of selection.arguments) {
              if (listArguments.includes(arg.name.value)) {
                const value = extractIntValue(arg.value);
                if (value && value > 0) {
                  multiplier = value;
                }
              }
            }
          }

          // Recursively compute complexity of nested selection sets.
          let childComplexity = 0;
          if (selection.selectionSet) {
            childComplexity = calculateSelections(selection.selectionSet.selections, state);
          }

          // Final complexity for this field.
          const fieldComplexity = (cost + childComplexity) * multiplier;

          total += fieldComplexity;
          break;
        }

        /**
         * INLINE_FRAGMENT
         * Example: ... on User { id name }
         * Inline fragments behave like nested selection sets.
         */
        case Kind.INLINE_FRAGMENT: {
          total += calculateSelections(selection.selectionSet.selections, state);
          break;
        }

        /**
         * FRAGMENT_SPREAD
         * Example: ...UserFields
         * We must guard against recursive fragments.
         */
        case Kind.FRAGMENT_SPREAD: {
          const name = selection.name.value;

          // Prevent infinite recursion.
          if (state.visitedFragments.includes(name)) break;

          const fragment = fragmentCache.get(name);
          if (!fragment) break; // Should be validated elsewhere.

          state.visitedFragments.push(name);

          total += calculateSelections(fragment.selectionSet.selections, state);
          break;
        }
      }
    }

    return total;
  }

  /**
   * Extracts an integer value from an AST literal node.
   * Supports INT and STRING literals. Variables are ignored because
   * this rule does not resolve variable values.
   */
  function extractIntValue(node: any): number | null {
    switch (node.kind) {
      case Kind.INT:
        return parseInt(node.value, 10);
      case Kind.STRING:
        return parseInt(node.value, 10) || null;
      case Kind.VARIABLE:
        return null; // Variables are not resolved here.
      default:
        return null;
    }
  }
}
