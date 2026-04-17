import type { ValidationRule } from 'graphql';
import depthLimitRule from './depth-limit-rule';
import complexityLimit from './сomplexity-limit-rule';
import type { Configuration } from '@via-profit-services/core';

export const buildValidationRules = (config: Configuration): ValidationRule[] => {
  const rules: ValidationRule[] = [];

  if (config.limits?.maxGraphQLDepthLimit) {
    rules.push(
      depthLimitRule({
        maxDepth: config.limits?.maxGraphQLDepthLimit,
        maxIntrospectionDepth: config.limits?.maxGraphQLDepthLimit,
      }),
    );
  }

  if (config.limits?.complexityLimit) {
    rules.push(
      complexityLimit({
        maxComplexity: config.limits.complexityLimit.maxComplexity,
        fieldCost: config.limits.complexityLimit.fieldCost,
        listArguments: ['first', 'limit', 'take', 'pageSize', 'size'],
      }),
    );
  }

  return rules;
};
