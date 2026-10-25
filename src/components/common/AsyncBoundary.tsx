import { Suspense } from 'react';
import type { ReactNode, ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';

import { LoadingFallback } from './LoadingFallback';
import { ErrorFallback } from './ErrorFallback';

interface AsyncBoundaryProps {
  children: ReactNode;
  pendingFallback?: ReactNode;
  rejectedFallback?: ComponentType<FallbackProps>;
}

export function AsyncBoundary({
  children,
  pendingFallback = <LoadingFallback />,
  rejectedFallback = ErrorFallback,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={rejectedFallback}>
      <Suspense fallback={pendingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
