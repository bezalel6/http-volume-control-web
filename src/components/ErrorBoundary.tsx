import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ReloadIcon, HomeIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;
  private retryTimeoutId: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isRetrying: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Report error to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you might send this to a service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // For now, just log to console
    console.error('Error Report:', errorReport);
    
    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error-reports') || '[]');
      existingErrors.push(errorReport);
      // Keep only the last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      localStorage.setItem('error-reports', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to store error report:', e);
    }
  };

  private handleRetry = () => {
    if (this.retryCount >= this.maxRetries) {
      return;
    }

    this.retryCount++;
    this.setState({ isRetrying: true });

    // Clear any existing retry timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Retry after a delay
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      });
    }, 1000);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    const details = document.getElementById('error-details');
    if (details) {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, isRetrying } = this.state;
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-card border rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <ExclamationTriangleIcon className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                The application encountered an unexpected error. We apologize for the inconvenience.
              </p>
            </div>

            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    disabled={isRetrying}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ReloadIcon className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying...' : `Retry (${this.maxRetries - this.retryCount} left)`}
                  </button>
                )}
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  <ReloadIcon className="h-4 w-4" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  <HomeIcon className="h-4 w-4" />
                  Go Home
                </button>
              </div>

              {/* Error Details Toggle */}
              {error && (
                <div className="border-t pt-4">
                  <button
                    onClick={this.toggleDetails}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <QuestionMarkCircledIcon className="h-4 w-4" />
                    Show technical details
                  </button>
                  
                  <div id="error-details" style={{ display: 'none' }} className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Error Message:</h3>
                      <div className="bg-muted p-3 rounded-md font-mono text-sm text-destructive">
                        {error.message}
                      </div>
                    </div>
                    
                    {error.stack && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Stack Trace:</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs max-h-40 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">{error.stack}</pre>
                        </div>
                      </div>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Component Stack:</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs max-h-40 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Help */}
            <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
              <p>
                If this problem persists, please check the browser console for more information
                or contact support with the error details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  public componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for manually triggering error boundary (useful for async errors)
export function useErrorHandler() {
  return (error: Error) => {
    // This will be caught by the nearest error boundary
    throw error;
  };
}