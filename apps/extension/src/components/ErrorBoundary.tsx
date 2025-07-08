import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg">
          <h3 className="font-bold">Something went wrong</h3>
          <p>{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}