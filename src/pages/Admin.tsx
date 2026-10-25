import { FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';
import { ErrorState } from '@/components';
import {
  useAdminReportsQuery,
  useDeleteReportMutation,
  useUser,
} from '@/hooks';

export const Admin = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUser();

  const { data: reports, isLoading, isError } = useAdminReportsQuery();
  const { mutate: deleteReport, isPending: isDeleting } =
    useDeleteReportMutation();

  if (!isLoggedIn) {
    return (
      <ErrorState
        label="접근 불가"
        title="관리자 전용 페이지입니다"
        description="접근 권한이 없습니다."
      />
    );
  }

  // 조회 전에 판정하면 관리자도 거부 화면을 본다
  if (isUserLoading) {
    return (
      <div className="text-text-muted flex grow items-center justify-center">
        권한을 확인하는 중...
      </div>
    );
  }

  // 네트워크 실패를 "권한 없음"으로 보여주면 안 된다
  if (isUserError) {
    return (
      <ErrorState
        label="오류"
        tone="danger"
        title="권한을 확인하지 못했습니다"
        description="네트워크 상태를 확인한 뒤 새로고침해 주세요."
      />
    );
  }

  // 비로그인과 같은 문구를 쓴다
  if (user?.role !== 'admin') {
    return (
      <ErrorState
        label="접근 불가"
        title="관리자 전용 페이지입니다"
        description="접근 권한이 없습니다."
      />
    );
  }

  return (
    <div className="flex w-full grow flex-col items-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-200">
        <div className="border-border-main mb-8 flex items-center justify-between border-b pb-6">
          <h1 className="text-text-main flex items-center gap-2.5 text-2xl font-black sm:text-3xl">
            <ShieldCheck
              className="text-primary"
              size={26}
              aria-hidden="true"
            />
            관리자 대시보드
          </h1>
          <Link
            to="/"
            className="border-border-main bg-bg-card text-text-main rounded-lg border px-4 py-2 text-sm font-bold transition-all hover:bg-white/5"
          >
            홈으로
          </Link>
        </div>

        {isLoading ? (
          <div className="text-text-muted py-20 text-center text-lg font-bold">
            데이터를 불러오는 중...
          </div>
        ) : isError ? (
          /* 실패를 "내역 없음"으로 보여주면 DB가 빈 줄 안다 */
          <div className="py-20 text-center">
            <p className="text-danger mb-2 font-bold">
              신고 내역을 불러오지 못했습니다.
            </p>
            <p className="text-text-muted text-sm">
              관리자 권한이 없거나 네트워크에 문제가 있을 수 있습니다.
            </p>
          </div>
        ) : !reports?.length ? (
          <div className="text-text-muted py-20 text-center">
            접수된 신고 내역이 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border-border-main bg-bg-card flex flex-col gap-4 rounded-xl border p-6 shadow-lg transition-transform hover:shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-primary text-xl font-black">
                    {report.battletag}
                  </h3>
                  <span className="text-text-muted text-sm">
                    {report.createdAt?.toDate?.()?.toLocaleString('ko-KR') ||
                      '날짜 미상'}
                  </span>
                </div>

                <p className="text-text-main text-base">
                  <strong className="text-text-muted">사유 : </strong>{' '}
                  {report.reason}
                </p>

                {report.details && (
                  <div className="border-text-muted mt-2 rounded-lg border-l-4 bg-black/20 p-4">
                    <span className="text-text-muted mb-2 flex items-center gap-1.5 text-xs font-bold">
                      <FileText
                        className="shrink-0"
                        size={13}
                        aria-hidden="true"
                      />
                      세부사항
                    </span>
                    <p className="text-text-main/90 text-sm leading-relaxed break-all whitespace-pre-wrap">
                      {report.details}
                    </p>
                  </div>
                )}

                <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <span className="text-text-muted text-sm">
                    신고자 UID : {report.reporterUid}
                  </span>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `${report.battletag}의 신고 내역을 삭제하시겠습니까?`,
                        )
                      ) {
                        deleteReport({ reportId: report.id });
                      }
                    }}
                    disabled={isDeleting}
                    className={cn(
                      'border-danger/20 bg-danger/10 text-danger rounded-lg border px-6 py-2 text-sm font-bold transition-all',
                      'hover:bg-danger hover:text-white',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
