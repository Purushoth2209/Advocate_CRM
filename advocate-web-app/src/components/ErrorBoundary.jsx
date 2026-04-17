import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  render() {
    if (this.state.err) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
          <p className="text-sm font-semibold text-gray-900">Something went wrong</p>
          <p className="text-xs text-red-700 mt-2 font-mono break-all">{String(this.state.err?.message || this.state.err)}</p>
          <button
            type="button"
            className="mt-6 text-xs font-semibold text-white bg-navy-700 px-4 py-2 rounded-xl"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
