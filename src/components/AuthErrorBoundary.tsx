import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ReloadIcon } from '@radix-ui/react-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed top-4 right-4 w-96 bg-background border border-destructive rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 bg-destructive/10 border-b border-destructive/20">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              Auth Debug Panel Error
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              The authentication debug panel encountered an error and couldn't render properly.
            </p>
            
            {this.state.error && (
              <div className="bg-muted p-2 rounded text-xs font-mono text-destructive">
                {this.state.error.message}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-3 py-2 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                <ReloadIcon className="h-3 w-3" />
                Retry
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Check the browser console for more details. This error won't affect the main application.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}