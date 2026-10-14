import {
  GraphQLError,
  Kind,
  getNamedType,
  getNullableType,
  isListType,
  isObjectType,
  isInterfaceType,
  type GraphQLNamedType,
  type GraphQLSchema,
  type ValidationRule,
  type ValidationContext,
  type SelectionNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  type ValueNode,
  type GraphQLField,
} from 'graphql';

import { DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIST_ARGUMENTS } from '../constants';

/**
 * Options for configuring the complexity‑limit validation rule.
 */
export interface ComplexityLimitOptions {
  /** Maximum allowed total complexity for a GraphQL operation */
  maxComplexity: number;

  /** Base cost of every field. Default: 1 */
  fieldCost?: number;

  /**
   * Argument names that represent list size or pagination limits.
   * If a field contains one of these arguments, its complexity is multiplied
   * by the argument value (a literal or a variable).
   */
  listArguments?: string[];

  /**
   * Multiplier for fields that return a list but have no list argument.
   * Default: 1 (disabled)
   */
  defaultListMultiplier?: number;

  /** Cost of an introspection field (__schema, __type and everything inside). Default: 2 */
  introspectionCost?: number;

  /** Maximum number of fields in one selection set. Default: no limit */
  maxFieldsPerSelection?: number;

  /**
   * Called with the complexity of every validated operation.
   * `info.width` is the largest number of fields in one selection set.
   */
  onComplete?: (complexity: number, info: { operationName: string; width: number }) => void;

  /** Custom error factory for overriding the default error message */
  createError?: (max: number, actual: number) => GraphQLError;

  /**
   * Variables of the current request. Validation runs before execution,
   * so without them `users(first: $count)` could not be estimated.
   */
  variables?: Readonly<Record<string, unknown>> | null;
}

/**
 * Creates a GraphQL validation rule that calculates the total complexity
 * of a query and rejects it if it exceeds the configured limit.
 *
 * Complexity model:
 *
 *   fieldComplexity = (fieldCost + childComplexity) * listMultiplier
 *
 * Example: `users(first: 100) { posts(first: 10) { id } }`
 *   posts = (1 + 1) * 10 = 20
 *   users = (1 + 20) * 100 = 2100
 *
 * Fragments: every spread is counted (a fragment used in two places costs
 * twice: it is executed twice). The cost of a fragment is computed once
 * and memoized, so the rule stays linear in the size of the document even
 * for a fragment fan-out where the real cost grows exponentially.
 *
 * All state lives inside a single validation, nothing is shared between requests.
 */
export default function complexityLimit(options: ComplexityLimitOptions): ValidationRule {
  const {
    maxComplexity,
    fieldCost = 1,
    listArguments = DEFAULT_MAX_GRAPHQL_COMPLEXITY_LIST_ARGUMENTS,
    defaultListMultiplier = 1,
    introspectionCost = 2,
    maxFieldsPerSelection,
    onComplete,
    createError,
    variables,
  } = options;

  return function ComplexityLimitRule(context: ValidationContext) {
    const schema = context.getSchema();
    const fragments = new Map<string, FragmentDefinitionNode>();
    for (const definition of context.getDocument().definitions) {
      if (definition.kind === Kind.FRAGMENT_DEFINITION) {
        fragments.set(definition.name.value, definition);
      }
    }

    return {
      OperationDefinition(node: OperationDefinitionNode) {
        const operationName = node.name?.value ?? '(anonymous)';
        const memo = new Map<string, number>();
        const inProgress = new Set<string>();
        let widthReported = false;
        let width = 0;

        // Default values of variables: `query($n: Int = 50)`
        const variableValues: Record<string, unknown> = {};
        for (const definition of node.variableDefinitions ?? []) {
          const name = definition.variable.name.value;
          if (variables && Object.prototype.hasOwnProperty.call(variables, name)) {
            variableValues[name] = variables[name];
          } else if (definition.defaultValue?.kind === Kind.INT) {
            variableValues[name] = Number(definition.defaultValue.value);
          }
        }

        const toInt = (value: ValueNode): number | null => {
          if (value.kind === Kind.INT) {
            return Number(value.value);
          }

          if (value.kind === Kind.VARIABLE) {
            const variable = variableValues[value.name.value];

            return typeof variable === 'number' && Number.isFinite(variable) ? variable : null;
          }

          return null;
        };

        // The largest of the list arguments: `items(first: 1, last: 1000)` costs 1000.
        // An argument that is omitted in the query (or passed as an unset variable)
        // takes the default value from the schema: `items(first: Int = 100)`.
        const listMultiplier = (
          field: FieldNode,
          fieldDef: GraphQLField<unknown, unknown> | null,
          returnsList: boolean,
        ): number => {
          let multiplier = 0;
          for (const name of listArguments) {
            const argument = field.arguments?.find(arg => arg.name.value === name);
            let value = argument ? toInt(argument.value) : null;
            if (value === null) {
              const defaultValue = fieldDef?.args.find(arg => arg.name === name)?.defaultValue;
              value = typeof defaultValue === 'number' && Number.isFinite(defaultValue) ? defaultValue : null;
            }
            if (value !== null && value > multiplier) {
              multiplier = Math.floor(value);
            }
          }

          if (multiplier > 0) {
            return multiplier;
          }

          return returnsList ? defaultListMultiplier : 1;
        };

        const fragmentCost = (name: string, insideIntrospection: boolean): number => {
          const key = `${insideIntrospection ? 'i' : 'r'}:${name}`;
          const cached = memo.get(key);
          if (typeof cached === 'number') {
            return cached;
          }

          const fragment = fragments.get(name);
          if (!fragment || inProgress.has(key)) {
            return 0; // reported by the standard rules
          }

          inProgress.add(key);
          const type = schema.getType(fragment.typeCondition.name.value);
          const cost = calculate(fragment.selectionSet.selections, type, insideIntrospection);
          inProgress.delete(key);
          memo.set(key, cost);

          return cost;
        };

        const calculate = (
          selections: readonly SelectionNode[],
          parentType: GraphQLNamedType | null | undefined,
          insideIntrospection: boolean,
        ): number => {
          let total = 0;
          let fieldsCount = 0;

          for (const selection of selections) {
            switch (selection.kind) {
              case Kind.FIELD: {
                fieldsCount += 1;
                const fieldName = selection.name.value;
                const isIntrospection =
                  insideIntrospection || (fieldName.startsWith('__') && fieldName !== '__typename');
                const fieldDef = getFieldDefinition(schema, parentType, fieldName);
                const returnsList = fieldDef ? isListType(getNullableType(fieldDef.type)) : false;
                const childType = fieldDef ? getNamedType(fieldDef.type) : null;

                const base = isIntrospection ? introspectionCost : fieldCost;
                const child = selection.selectionSet
                  ? calculate(selection.selectionSet.selections, childType, isIntrospection)
                  : 0;

                total += (base + child) * listMultiplier(selection, fieldDef, returnsList);
                break;
              }

              case Kind.INLINE_FRAGMENT: {
                const type = selection.typeCondition
                  ? schema.getType(selection.typeCondition.name.value)
                  : parentType;
                total += calculate(selection.selectionSet.selections, type, insideIntrospection);
                break;
              }

              case Kind.FRAGMENT_SPREAD:
                total += fragmentCost(selection.name.value, insideIntrospection);
                break;
            }
          }

          width = Math.max(width, fieldsCount);

          if (
            typeof maxFieldsPerSelection === 'number' &&
            fieldsCount > maxFieldsPerSelection &&
            !widthReported
          ) {
            widthReported = true;
            context.reportError(
              new GraphQLError(
                `'${operationName}' A selection set contains ${fieldsCount} fields. Maximum allowed is ${maxFieldsPerSelection}.`,
                { nodes: [node] },
              ),
            );
          }

          return total;
        };

        const rootType = schema.getRootType(node.operation);
        const complexity = calculate(node.selectionSet.selections, rootType, false);

        onComplete?.(complexity, { operationName, width });

        if (complexity > maxComplexity) {
          context.reportError(
            createError
              ? createError(maxComplexity, complexity)
              : new GraphQLError(
                  `'${operationName}' Query complexity ${complexity} exceeds the maximum allowed complexity of ${maxComplexity}.`,
                  { nodes: [node] },
                ),
          );
        }
      },
    };
  };
}

/**
 * Field definition from the schema, null for unknown fields
 * (they are reported by the standard FieldsOnCorrectType rule)
 * and for introspection meta-fields.
 */
const getFieldDefinition = (
  _schema: GraphQLSchema,
  parentType: GraphQLNamedType | null | undefined,
  fieldName: string,
) => {
  if (parentType && (isObjectType(parentType) || isInterfaceType(parentType))) {
    return parentType.getFields()[fieldName] ?? null;
  }

  return null;
};
