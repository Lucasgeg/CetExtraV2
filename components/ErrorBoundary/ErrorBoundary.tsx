// components/ErrorBoundary.tsx
"use client";
import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return (
        <Fallback
          error={this.state.error!}
          retry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  retry
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-red-600">Erreur lors du chargement des missions</p>
      <p className="text-sm text-gray-500">{error.message}</p>
      <button
        onClick={retry}
        className="rounded bg-employer-primary px-4 py-2 text-white hover:bg-employer-secondary"
      >
        Réessayer
      </button>
    </div>
  );
}

export default ErrorBoundary;
