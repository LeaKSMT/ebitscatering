import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });


    if (window.Sentry) {
      window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }


    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.208V12c0-1.987-1.398-3.064-2.502-4.208l-7.5-7.5c-1.144-1.144-2.663-1.762-4.208-1.762H4c-1.54 0-2.502 1.667-2.502 3.208V12c0 1.987 1.398 3.064 2.502 4.208l7.5 7.5c1.144 1.144 2.663 1.762 4.208 1.762z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h1>
              <p className="text-red-600 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left mt-4 p-4 bg-red-100 rounded">
                  <summary className="cursor-pointer font-medium text-red-800">Error Details</summary>
                  <pre className="mt-2 text-xs text-red-700 overflow-auto">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && (
                      <div className="mt-2">
                        <strong>Component Stack:</strong>
                        <br />
                        {this.state.errorInfo.componentStack}
                      </div>
                    )}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
