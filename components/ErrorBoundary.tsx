'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { errorTracker } from '@/utils/errorTracking';
import { env } from '@/utils/env';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate a unique error ID to help with troubleshooting
    const errorId = `err_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      errorInfo,
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to our error tracking system with detailed context
    errorTracker.captureException(error, {
      component: 'ErrorBoundary',
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      errorMessage: error.message,
      errorName: error.name,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: Date.now(),
    });
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReport = (): void => {
    // Copy error details to clipboard for easy reporting
    if (navigator.clipboard && window.isSecureContext) {
      const errorDetails = `
Error ID: ${this.state.errorId}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
Error: ${this.state.error?.toString() || 'Unknown error'}
      `.trim();

      navigator.clipboard
        .writeText(errorDetails)
        .then(() => {
          alert(
            'Error details copied to clipboard. You can paste this in your report.'
          );
        })
        .catch(() => {
          console.error('Failed to copy error details');
        });
    }
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg">
              <div className="mb-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <svg
                    className="h-6 w-6 text-red-600 dark:text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Something went wrong
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We apologize for the inconvenience. Please try refreshing the
                page or click below to retry.
              </p>

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Error ID: {this.state.errorId}
              </div>

              {env.NODE_ENV === 'development' && this.state.error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-left text-sm text-gray-800 dark:text-gray-200 overflow-auto max-h-60">
                    <code>
                      <strong>Error:</strong> {this.state.error.toString()}
                      {'\n\n'}
                      <strong>Component Stack:</strong>{' '}
                      {this.state.errorInfo?.componentStack}
                    </code>
                  </pre>
                </motion.div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:outline-none transition-colors duration-200"
                >
                  Try Again
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:outline-none transition-colors duration-200"
                >
                  Refresh Page
                </button>

                {env.NODE_ENV === 'production' && (
                  <button
                    onClick={this.handleReport}
                    className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:outline-none transition-colors duration-200"
                  >
                    Report Issue
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
