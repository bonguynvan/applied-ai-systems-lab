import { z } from 'zod';

export interface ExperimentMetadata {
  name: string;
  slug: string;
  description: string;
  costWeight: number;
  promptVersion: string;
}

export interface ExperimentModule<TInput = any, TOutput = any> {
  metadata: ExperimentMetadata;
  inputSchema: z.ZodType<TInput, any, any>;
  outputSchema: z.ZodType<TOutput, any, any>;
  prompt: (input: TInput) => string;
  handler: (aiResponse: string, input: TInput) => TOutput;
}

export interface ExecutionContext {
  experimentSlug: string;
  startTime: number;
  inputHash: string;
  cached: boolean;
}

export type ErrorType = 'rate_limit' | 'budget' | 'validation' | 'api_key' | 'server';

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionId: string;
  /** When 429 rate limit: seconds until user can retry */
  resetInSeconds?: number;
  /** Classified error for UI (icon, title, suggestion) */
  errorType?: ErrorType;
  metadata: {
    latency: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costEstimate: number;
    cached: boolean;
    model: string;
  };
}
