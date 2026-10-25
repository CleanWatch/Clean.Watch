import type { FallbackProps } from 'react-error-boundary';
import { ErrorState, ErrorAction } from './ErrorState';

// 렌더 에러 화면. 404와 달리 할 일이 "다시 시도"라 문구를 구분한다.
export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  // 에러 원문은 로컬에서만. 사용자가 읽고 조치할 수 없는 문구라서다.
  const detail = import.meta.env.DEV ? (error as Error)?.message : null;

  return (
    <ErrorState
      label="오류"
      tone="danger"
      title="문제가 발생했습니다"
      description={
        <>
          잠시 후 다시 시도해 주세요.
          <br />
          계속되면 관리자에게 알려주세요.
        </>
      }
      actions={
        <>
          <ErrorAction onClick={resetErrorBoundary}>다시 시도</ErrorAction>
          <ErrorAction to="/" variant="secondary">
            홈으로
          </ErrorAction>
        </>
      }
    >
      {detail && (
        <div className="border-border-main bg-bg-card mt-6 w-full max-w-85 rounded-lg border p-3 text-left">
          <p className="text-text-muted mb-1 text-[10px] font-bold tracking-[0.08em]">
            DEV ONLY
          </p>
          <code className="text-danger text-[11px] break-all">{detail}</code>
        </div>
      )}
    </ErrorState>
  );
}
