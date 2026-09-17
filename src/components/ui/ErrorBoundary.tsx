import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, LogIn } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log to console for debugging root cause in browser
    console.error("ST-SOLUTIONS ErrorBoundary caught an unhandled render error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReturnToSignIn = () => {
    window.location.href = "/login";
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      const isDev = Boolean(
        typeof import.meta !== "undefined" &&
          (import.meta as any).env &&
          (import.meta as any).env.DEV
      );

      return (
        <div
          id="st-error-boundary-screen"
          className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            {/* ST-Solutions Brand Header */}
            <div className="flex items-center justify-center gap-3">
              <img
                src="/favicon.svg"
                alt="ST-Solutions Logo"
                className="w-10 h-10 shrink-0"
              />
              <span className="font-extrabold text-xl tracking-wider text-slate-900 dark:text-white font-mono">
                ST-SOLUTIONS
              </span>
            </div>

            {/* Error Indicator & Title */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {this.props.fallbackTitle || "Admin interface failed to render"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                An unexpected interface rendering issue occurred. Your secure credentials and session state remain protected.
              </p>
            </div>

            {/* Safe technical error message in development only */}
            {isDev && this.state.error && (
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left font-mono text-xs text-red-600 dark:text-red-400 overflow-x-auto max-h-36">
                <p className="font-bold mb-1">Runtime Diagnostic:</p>
                <p>{this.state.error.name}: {this.state.error.message}</p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                    {this.state.error.stack.split("\n").slice(0, 4).join("\n")}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                id="error-boundary-reload-btn"
                onClick={this.handleReload}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#C59B27] hover:to-[#D4AF37] text-slate-950 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>

              <button
                type="button"
                id="error-boundary-retry-btn"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl font-medium text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Try Again
              </button>

              <button
                type="button"
                id="error-boundary-signin-btn"
                onClick={this.handleReturnToSignIn}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
