import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Runtime Error Caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] p-6 text-gray-100">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-gray-400">
              An unexpected error occurred while rendering the page.
            </p>
            {this.state.error && (
              <pre className="p-3 rounded-xl bg-black/60 text-rose-300 text-xs text-left overflow-x-auto font-mono">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reload Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
