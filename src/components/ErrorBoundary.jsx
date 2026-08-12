import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Centralized hook for wiring up real error reporting (Sentry, etc.) later.
    console.error('Unhandled UI error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
            <AlertTriangle className="text-red-600" size={28} />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            An unexpected error occurred. Try reloading — if this keeps happening, please contact support.
          </p>
          <button
            onClick={this.handleReload}
            className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white"
          >
            <RefreshCw size={16} /> Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}