
import type { RequestState } from './request-state';
import {
  DEFAULT_JSON_MAX_BYTES,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_FILE_TOTAL_SIZE,
} from '../constants';
import type { Configuration, LimitsUsage } from './types';

/**
 * Usage of the limits by the request: only the values that were measured
 */
export const buildLimitsUsage = (
  state: RequestState,
  limits: Configuration['limits'],
): LimitsUsage => {
  const { bodyStats, measurements } = state;
  const complexityLimit = limits?.complexityLimit;
  const usage: Record<string, unknown> = { operationName: state.operationName };
  const add = (name: keyof LimitsUsage, value: number | undefined, max: number | undefined) => {
    if (typeof value === 'number') {
      usage[name] = { value, max: max || null };
    }
  };

  add('bodySize', bodyStats?.bodySize, limits?.maxJSONBodySize || DEFAULT_JSON_MAX_BYTES);
  add('files', bodyStats?.files, limits?.maxFiles ?? DEFAULT_MAX_FILES);
  add(
    'filesTotalSize',
    bodyStats?.filesTotalSize,
    limits?.maxFilesTotalSize ?? DEFAULT_MAX_FILE_TOTAL_SIZE,
  );
  add('tokens', state.tokens, limits?.maxGraphQLTokens);
  add('depth', measurements.depth, limits?.maxGraphQLDepthLimit);
  add('complexity', measurements.complexity, complexityLimit?.maxComplexity);
  add(
    'width',
    measurements.width,
    complexityLimit?.maxComplexity ? complexityLimit.maxFieldsPerSelection : undefined,
  );

  return usage as unknown as LimitsUsage;
};
