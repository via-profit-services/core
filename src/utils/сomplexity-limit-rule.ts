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
 *   Maximum allowed total complexity for a GraphQL operation.
 *
 * fieldCost:
 *   Base cost assigned to every field. Default: 1.
 *
 * listArguments:
 *   Argument names that represent list size or pagination limits.
 *   If a field contains one of these arguments, its complexity is multiplied
 *   by the argument value.
 */
export interface ComplexityLimitOptions {
  maxComplexity: number;
  fieldCost?: number;
  listArguments?: string[];
}

/**
 * Internal state passed through recursive complexity calculations.
 *
 * visitedFragments:
 *   Tracks fragment names to prevent infinite recursion.
 *
 * report:
 *   Helper for reporting validation errors.
 */
type CheckState = {
  visitedFragments: string[];
  report: (msg: string) => void;
};

/**
 * Creates a GraphQL validation rule that calculates the total complexity
 * of a query and rejects it if it exceeds the configured limit.
 *
 * Complexity model:
 *
 *   fieldComplexity = (fieldCost + childComplexity) * listMultiplier
 *
 * This multiplicative model reflects real server load more accurately
 * than a simple additive approach.
 */
export default function complexityLimit(options: ComplexityLimitOptions): ValidationRule {
  const {
    maxComplexity,
    fieldCost = 1,
    listArguments = ['first', 'limit', 'take', 'pageSize', 'size'],
  } = options;

  /**
   * Cache of fragment definitions for quick lookup.
   */
  const fragmentCache = new Map<string, FragmentDefinitionNode>();

  return function ComplexityLimitRule(context: ValidationContext) {
    return {
      /**
       * Entry point for complexity validation.
       * Triggered once per operation definition.
       */
      OperationDefinition(node) {
        // Collect fragment definitions once per document.
        const doc = context.getDocument();
        for (const def of doc.definitions) {
          if (def.kind === Kind.FRAGMENT_DEFINITION) {
            fragmentCache.set(def.name.value, def);
          }
        }

        const state: CheckState = {
          visitedFragments: [],
          report: msg =>
            context.reportError(
              new GraphQLError(`'${node.name?.value ?? '(anonymous)'}' ${msg}`, [node]),
            ),
        };

        const complexity = calculateSelections(node.selectionSet.selections, state);

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
   */
  function calculateSelections(
    selections: readonly SelectionNode[],
    state: CheckState,
  ): number {
    let total = 0;

    for (const selection of selections) {
      switch (selection.kind) {
        case Kind.FIELD: {
          const base = fieldCost;
          const multiplier = extractListMultiplier(selection, listArguments);
          const child = selection.selectionSet
            ? calculateSelections(selection.selectionSet.selections, state)
            : 0;

          total += (base + child) * multiplier;
          break;
        }

        case Kind.INLINE_FRAGMENT: {
          total += calculateSelections(selection.selectionSet.selections, state);
          break;
        }

        case Kind.FRAGMENT_SPREAD: {
          const name = selection.name.value;

          // Prevent infinite recursion.
          if (state.visitedFragments.includes(name)) break;

          const fragment = fragmentCache.get(name);
          if (!fragment) break;

          state.visitedFragments.push(name);
          total += calculateSelections(fragment.selectionSet.selections, state);
          break;
        }
      }
    }

    return total;
  }

  /**
   * Extracts list multiplier from field arguments.
   * Example: users(first: 50) → multiplier = 50
   */
  function extractListMultiplier(
    selection: any,
    listArguments: string[],
  ): number {
    if (!selection.arguments?.length) return 1;

    for (const arg of selection.arguments) {
      if (listArguments.includes(arg.name.value)) {
        const value = extractIntValue(arg.value);
        if (value && value > 0) return value;
      }
    }

    return 1;
  }

  /**
   * Extracts an integer value from an AST literal node.
   * Variables are ignored because this rule does not resolve them.
   */
  function extractIntValue(node: any): number | null {
    switch (node.kind) {
      case Kind.INT:
        return parseInt(node.value, 10);
      case Kind.STRING:
        return parseInt(node.value, 10) || null;
      case Kind.VARIABLE:
        return null;
      default:
        return null;
    }
  }
}
