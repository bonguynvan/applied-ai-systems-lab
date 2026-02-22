import { Logger, LogEvent, ExperimentLogEvent } from '@/types/observability';

class StructuredLogger implements Logger {
  private logs: LogEvent[] = [];
  private maxLogs = 1000;

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  logExperiment(event: ExperimentLogEvent): void {
    this.log('info', `Experiment: ${event.experimentSlug}`, {
      experimentSlug: event.experimentSlug,
      inputHash: event.inputHash,
      outputHash: event.outputHash,
      metadata: event.metadata,
      ...event.context,
    });
  }

  private log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    context?: Record<string, any>
  ): void {
    const event: LogEvent = {
      timestamp: Date.now(),
      level,
      message,
      context,
    };

    this.logs.push(event);

    // Keep memory under control
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${level.toUpperCase()}]`;
      if (context) {
        console.log(prefix, message, context);
      } else {
        console.log(prefix, message);
      }
    }
  }

  getLogs(limit?: number): LogEvent[] {
    if (!limit) return this.logs;
    return this.logs.slice(-limit);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Global singleton
let loggerInstance: StructuredLogger | null = null;

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new StructuredLogger();
  }
  return loggerInstance;
}

export function createLogger(): Logger {
  return new StructuredLogger();
}
