/* src/components/common/ErrorFallback.tsx */

import type { FallbackProps } from 'react-error-boundary';
import { ErrorState, ErrorAction } from './ErrorState';

/**
 * 렌더 중 에러가 났을 때 그 자리를 대신 채웁니다.
 *
 * 404와 문구가 겹치지 않게 씁니다. 저쪽은 주소가 틀린 것이고 여기는 우리 쪽이
 * 터진 것이라, 사용자가 할 일이 다릅니다 — 다른 데로 가는 게 아니라 다시 해보는 것.
 */
export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  // 에러 원문은 로컬에서만 보여줍니다.
  //
  // 숨긴다고 감춰지는 값은 아닙니다. 이미 사용자 브라우저 안에 있고 콘솔과
  // Network 탭에 그대로 남습니다. 진짜 통제는 서버가 안 보내는 것이고
  // (api/_lib의 toErrorResponse), 그건 이미 되어 있습니다.
  //
  // 화면에서 빼는 이유는 다릅니다. `FirebaseError: Missing or insufficient
  // permissions.`를 본 사용자는 할 수 있는 게 없습니다. 읽고 조치할 수 있는
  // 문구를 대신 주는 편이 낫습니다.
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
        <div className="border-border-main bg-bg-card mt-3 w-full max-w-85 rounded-lg border p-3 text-left">
          <p className="text-text-muted mb-1 text-[10px] font-bold tracking-[0.08em]">
            DEV ONLY
          </p>
          <code className="text-danger text-[11px] break-all">{detail}</code>
        </div>
      )}
    </ErrorState>
  );
}
