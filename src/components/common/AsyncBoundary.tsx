import { Suspense } from 'react';
import type { ReactNode, ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';

import { LoadingFallback } from './LoadingFallback';
import { ErrorFallback } from './ErrorFallback';

interface AsyncBoundaryProps {
  children: ReactNode;
  // 기능적 가이드: 특정 페이지 전용 커스텀 UI를 넣고 싶을 때 아래 Props를 활용하도록 허용합니다.
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
