import type { ValidationRule } from 'graphql';
import type { Configuration } from '@via-profit-services/core';

import depthLimitRule from './depth-limit-rule';
import complexityLimitRule from './complexity-limit-rule';

/**
 * Rules that do not depend on the request: built once in the factory.
 * A copy of this array is passed to middlewares on every request.
 */
export const buildValidationRules = (config: Configuration): ValidationRule[] => {
  const rules: ValidationRule[] = [];
  const { limits } = config;

  if (limits?.maxGraphQLDepthLimit) {
    rules.push(
      depthLimitRule({
        maxDepth: limits.maxGraphQLDepthLimit,
        maxIntrospectionDepth: limits.maxGraphQLIntrospectionDepthLimit,
      }),
    );
  }

  return rules;
};

/**
 * The complexity rule needs the variables of the current request
 * (`users(first: $count)`), so it is built for every request.
 * Building it is cheap: it only creates closures.
 */
export const buildComplexityRule = (
  config: Configuration,
  variables: Readonly<Record<string, unknown>> | null,
): ValidationRule | null => {
  const options = config.limits?.complexityLimit;

  if (!options || !options.maxComplexity) {
    return null;
  }

  return complexityLimitRule({ ...options, variables });
};
