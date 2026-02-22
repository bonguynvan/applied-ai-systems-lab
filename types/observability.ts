export interface LogEvent {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
}

export interface ExperimentLogEvent extends LogEvent {
  experimentSlug: string;
  inputHash: string;
  outputHash?: string;
  metadata?: {
    latency: number;
    inputTokens?: number;
    outputTokens?: number;
    costEstimate?: number;
    cacheHit: boolean;
    model: string;
    error?: string;
  };
}

export interface Logger {
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
  logExperiment(event: ExperimentLogEvent): void;
  getLogs(limit?: number): LogEvent[];
}
