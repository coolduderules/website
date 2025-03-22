/** @format */
import { ErrorSeverity } from '@/types/telegram';
import { env } from './env';

interface ErrorDetails {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: number;
  severity: ErrorSeverity;
  source: 'client' | 'server';
  url?: string;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private readonly errors: ErrorDetails[] = [];
  private readonly MAX_ERRORS = 100;
  private readonly errorCounts: Map<
    string,
    { count: number; firstSeen: number }
  > = new Map();
  private readonly RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
  private readonly MAX_ERRORS_PER_TYPE = 10;

  private constructor() {
    // Singleton pattern
    if (typeof window !== 'undefined') {
      // Setup global error handler in browser
      window.addEventListener('error', event => {
        this.captureException(event.error || new Error(event.message), {
          source: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
        });

        // Don't prevent default handling
        return false;
      });

      // Setup unhandled promise rejection handler
      window.addEventListener('unhandledrejection', event => {
        this.captureException(
          event.reason || new Error('Unhandled Promise rejection'),
          {
            promise: 'Unhandled Promise rejection',
          }
        );
      });
    }
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private getEnvironment(): string {
    if (typeof process === 'undefined') return 'client';
    if (env.NEXT_PHASE === 'phase-production-build') return 'build';
    return env.NODE_ENV || 'development';
  }

  private getAppUrl(): string {
    if (typeof process === 'undefined') return window.location.origin;
    if (env.NEXT_PUBLIC_APP_URL) {
      return env.NEXT_PUBLIC_APP_URL;
    }
    return 'http://localhost:3000';
  }

  private async logError(details: ErrorDetails): Promise<void> {
    try {
      const response = await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(details),
      });

      if (!response.ok) {
        console.error('Failed to log error:', await response.text());
      }
    } catch (err) {
      console.error('Error logging failed:', err);
    }
  }

  private getErrorSignature(error: Error | unknown): string {
    if (error instanceof Error) {
      // Include first line of stack to get better error grouping
      const stackLine = error.stack?.split('\n')[1]?.trim();
      return `${error.name}:${error.message}:${stackLine || ''}`;
    }
    return String(error);
  }

  private shouldSkipError(message: string): boolean {
    // Skip known non-actionable errors
    const ignoredPatterns = [
      // Network errors that don't need to be tracked
      'Failed to fetch',
      'NetworkError when attempting to fetch resource',
      'The network connection was lost',
      'Network request failed',
      // CORS issues
      'Cross-Origin Request Blocked',
      // Canceled operations
      'The operation was aborted',
      'User aborted',
      // 3rd party content blocking by browser extensions
      'extension', // Many extension-related errors contain this word
      'Script error.', // Cross-origin script errors with no details
    ];

    return ignoredPatterns.some(pattern =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  async captureException(
    error: Error | unknown,
    context?: Record<string, unknown> | ErrorSeverity
  ): Promise<void> {
    const errorDetails: ErrorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: typeof context === 'object' ? context : undefined,
      timestamp: Date.now(),
      severity: typeof context === 'string' ? context : 'medium',
      source: typeof window === 'undefined' ? 'server' : 'client',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    await this.logError(errorDetails);
  }

  async captureMessage(
    message: string,
    context?: Record<string, unknown>,
    severity: ErrorSeverity = 'low'
  ): Promise<void> {
    const errorDetails: ErrorDetails = {
      message,
      context,
      timestamp: Date.now(),
      severity,
      source: typeof window === 'undefined' ? 'server' : 'client',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    await this.logError(errorDetails);
  }

  getRecentErrors(): ErrorDetails[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors.length = 0;
    this.errorCounts.clear();
  }
}

export const errorTracker = ErrorTracker.getInstance();
