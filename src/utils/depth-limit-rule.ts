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
 *   Maximum allowed nesting depth inside introspection fields (__schema, __type).
 *   Defaults to maxDepth if not provided.
 */
export interface DepthLimitOptions {
  maxDepth: number;
  maxIntrospectionDepth?: number;
}

type Depth = {
  /** depth of regular fields */
  regular: number;
  /** depth counted from an introspection root field (__schema, __type) */
  introspection: number;
};

const ZERO: Depth = { regular: 0, introspection: 0 };

/**
 * Creates a GraphQL validation rule that enforces maximum query depth.
 *
 * Depth is the number of nested selection sets of FIELDS:
 *
 *   { users { posts { id } } }                         → 2
 *   { users { ...F } } fragment F on User { posts { id } } → 2 (the same query)
 *   { users { ... on User { posts { id } } } }         → 2 (the same query)
 *
 * Fragments are only a way to write a query, so they do not add a level.
 *
 * Introspection subtrees are measured separately with `maxIntrospectionDepth`:
 * the standard introspection query (GraphiQL, codegen) is deeper than usual
 * business queries.
 *
 * Performance. A fragment may be spread many times, and fragments may spread
 * other fragments: `F0 { ...F1 ...F1 ... }`, `F1 { ...F2 ...F2 ... }` etc.
 * Walking every spread costs fan-out^levels steps: a 1 KB query takes
 * seconds of CPU and blocks the event loop. Therefore the depth of every
 * fragment is computed once per document and memoized: the rule is linear
 * in the size of the document.
 *
 * All state lives inside a single validation (`context`), nothing is shared
 * between requests.
 */
export default function depthLimit(options: DepthLimitOptions): ValidationRule {
  const { maxDepth, maxIntrospectionDepth = maxDepth } = options;

  return function DepthLimitRule(context: ValidationContext) {
    const fragments = new Map<string, FragmentDefinitionNode>();
    for (const definition of context.getDocument().definitions) {
      if (definition.kind === Kind.FRAGMENT_DEFINITION) {
        fragments.set(definition.name.value, definition);
      }
    }

    const memo = new Map<string, Depth>();
    const inProgress = new Set<string>();

    const measureFragment = (name: string, insideIntrospection: boolean): Depth => {
      const key = `${insideIntrospection ? 'i' : 'r'}:${name}`;
      const cached = memo.get(key);
      if (cached) {
        return cached;
      }

      const fragment = fragments.get(name);
      // Unknown fragments and cycles are reported by the standard rules
      // (KnownFragmentNames, NoFragmentCycles)
      if (!fragment || inProgress.has(key)) {
        return ZERO;
      }

      inProgress.add(key);
      const depth = measure(fragment.selectionSet.selections, insideIntrospection);
      inProgress.delete(key);
      memo.set(key, depth);

      return depth;
    };

    const measure = (selections: readonly SelectionNode[], insideIntrospection: boolean): Depth => {
      let regular = 0;
      let introspection = 0;

      for (const selection of selections) {
        let child: Depth;

        switch (selection.kind) {
          case Kind.FIELD: {
            if (!selection.selectionSet) {
              continue; // a leaf field does not add depth
            }

            const isIntrospection = insideIntrospection || selection.name.value.startsWith('__');
            child = measure(selection.selectionSet.selections, isIntrospection);

            if (isIntrospection) {
              introspection = Math.max(introspection, 1 + child.introspection);
            } else {
              regular = Math.max(regular, 1 + child.regular);
              introspection = Math.max(introspection, child.introspection);
            }
            continue;
          }

          case Kind.INLINE_FRAGMENT:
            child = measure(selection.selectionSet.selections, insideIntrospection);
            break;

          case Kind.FRAGMENT_SPREAD:
            child = measureFragment(selection.name.value, insideIntrospection);
            break;

          default:
            continue;
        }

        regular = Math.max(regular, child.regular);
        introspection = Math.max(introspection, child.introspection);
      }

      return { regular, introspection };
    };

    return {
      OperationDefinition(node: OperationDefinitionNode) {
        const depth = measure(node.selectionSet.selections, false);
        const operationName = node.name?.value ?? '(anonymous)';

        if (depth.regular > maxDepth) {
          context.reportError(
            new GraphQLError(
              `'${operationName}' The query is too deeply nested. Maximum allowed depth is ${maxDepth}.`,
              { nodes: [node] },
            ),
          );
        }

        if (depth.introspection > maxIntrospectionDepth) {
          context.reportError(
            new GraphQLError(
              `'${operationName}' The introspection query is too deeply nested. Maximum allowed depth is ${maxIntrospectionDepth}.`,
              { nodes: [node] },
            ),
          );
        }
      },
    };
  };
}
