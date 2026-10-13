import type { ValidationRule } from 'graphql';
import type { Configuration } from '@via-profit-services/core';

import depthLimitRule from './depth-limit-rule';
import complexityLimitRule from './complexity-limit-rule';

/**
 * Collects the measured values of one request (see `limits.onUsage`).
 * A document may contain several operations: the largest value is kept,
 * it is the one that was checked against the limit.
 */
export type RuleMeasurements = {
  depth?: number;
  complexity?: number;
  width?: number;
};

const keepMax = (current: number | undefined, value: number) =>
  typeof current === 'number' ? Math.max(current, value) : value;

/**
 * Depth and complexity rules of a request.
 *
 * They are built for every request: the complexity rule needs the variables
 * (`users(first: $count)`), and both rules report the measured values of
 * this request. Building them is cheap: it only creates closures.
 *
 * With `measurements` a disabled limit is still measured (with an infinite
 * maximum): the values are needed to choose the limit.
 */
export const buildRequestRules = (
  config: Configuration,
  variables: Readonly<Record<string, unknown>> | null,
  measurements?: RuleMeasurements,
): ValidationRule[] => {
  const rules: ValidationRule[] = [];
  const { limits } = config;
  const maxDepth = limits?.maxGraphQLDepthLimit;

  if (maxDepth || measurements) {
    rules.push(
      depthLimitRule({
        maxDepth: maxDepth || Infinity,
        maxIntrospectionDepth: maxDepth ? limits?.maxGraphQLIntrospectionDepthLimit : Infinity,
        onComplete: measurements
          ? depth => {
              measurements.depth = keepMax(measurements.depth, depth);
            }
          : undefined,
      }),
    );
  }

  const options = limits?.complexityLimit;
  const maxComplexity = options?.maxComplexity;

  if (maxComplexity) {
    rules.push(
      complexityLimitRule({
        ...options,
        maxComplexity,
        variables,
        onComplete: (complexity, info) => {
          if (measurements) {
            measurements.complexity = keepMax(measurements.complexity, complexity);
            measurements.width = keepMax(measurements.width, info.width);
          }
          options.onComplete?.(complexity, info);
        },
      }),
    );
  } else if (measurements) {
    // measure only: no complexity and no width limit
    rules.push(
      complexityLimitRule({
        ...options,
        maxComplexity: Infinity,
        maxFieldsPerSelection: undefined,
        variables,
        onComplete: (complexity, info) => {
          measurements.complexity = keepMax(measurements.complexity, complexity);
          measurements.width = keepMax(measurements.width, info.width);
        },
      }),
    );
  }

  return rules;
};
