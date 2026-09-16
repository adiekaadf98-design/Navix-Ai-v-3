import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white p-6 flex flex-col items-center justify-center font-sans">
          <div className="max-w-md w-full bg-[#111111] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-white">NAVIX AI • Pemulihan Sesi</h2>
            <p className="text-xs text-neutral-400">
              Terjadi pembaruan komponen di latar belakang. Silakan muat ulang aplikasi untuk menerapkan perbaikan.
            </p>
            
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              Muat Ulang NAVIX AI
            </button>

            {this.state.error && (
              <details className="text-left text-[10px] font-mono text-neutral-500 bg-black/60 p-3 rounded-xl border border-neutral-800 overflow-x-auto max-h-40">
                <summary className="cursor-pointer text-red-400 font-semibold mb-1">Detail Teknis</summary>
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
