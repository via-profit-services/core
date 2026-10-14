import type { ValidationRule } from 'graphql';

import type { RuleMeasurements } from '../validation/build-validation-rules';
import type { BodyStats } from '../http/body-stats';
import type { Context, RequestDiagnostics } from './types';

/**
 * State of a single request shared by the error boundary (httpListener)
 * and the processing steps (processRequest).
 */
export type RequestState = {
  readonly context: Context;
  readonly requestId: string;
  /** Number of this request since the start (stats.requestCounter is shared) */
  readonly requestNumber: number;
  /** Fields added by the project: middleware `extensions` and `setExtension` */
  readonly extensions: Record<string, unknown>;
  readonly validationRule: ValidationRule[];
  /** Removes temporary upload files (see graphql-file-uploader) */
  uploadCleanup?: () => void;

  // Measurements, filled while the request goes through the steps
  readonly measurements: RuleMeasurements;
  readonly timing: { -readonly [K in keyof RequestDiagnostics['timing']]: number };
  bodyStats?: BodyStats;
  tokens?: number;
  documentParsed: boolean;
  operationName: string | null;
  persisted: boolean;
  documentCache: 'hit' | 'miss';
};
