/* src/pages/Admin.tsx */

import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';
import {
  useAdminReportsQuery,
  useDeleteReportMutation,
  useUser,
} from '@/hooks';

// 접근이 막혔을 때 보여줄 안내. 비로그인과 권한 부족 양쪽에서 씁니다.
const AccessDenied = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100dvh-160px)] flex-col items-center justify-center gap-4 text-white">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-text-muted text-sm">{description}</p>}
      <button
        onClick={() => navigate('/')}
        className="bg-border-main rounded-lg px-6 py-2 font-bold text-white transition-all hover:bg-white/10"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
};

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

  // 인증 가드
  if (!isLoggedIn) {
    return <AccessDenied title="🚨 관리자 전용 페이지입니다." />;
  }

  // 권한 조회가 끝나기 전에 판정하면 실제 관리자도 거부 화면을 봅니다.
  if (isUserLoading) {
    return (
      <div className="text-text-muted flex min-h-[calc(100dvh-160px)] items-center justify-center">
        권한을 확인하는 중...
      </div>
    );
  }

  // 조회 실패를 "권한 없음"으로 표시하면 관리자가 권한을 잃은 줄 오해합니다.
  // 네트워크 문제와 실제 권한 부족은 반드시 구분해야 합니다.
  if (isUserError) {
    return (
      <AccessDenied
        title="⚠️ 권한을 확인하지 못했습니다."
        description="네트워크 상태를 확인한 뒤 새로고침해 주세요."
      />
    );
  }

  // 권한 가드. 로그인 여부는 따로 알려주지 않아 비로그인과 같은 문구를 씁니다.
  if (user?.role !== 'admin') {
    return <AccessDenied title="🚨 관리자 전용 페이지입니다." />;
  }

  return (
    <div className="flex min-h-[calc(100dvh-160px)] w-full flex-col items-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-200">
        <div className="border-border-main mb-8 flex items-center justify-between border-b pb-6">
          <h1 className="text-text-main text-2xl font-black sm:text-3xl">
            🛠️ 관리자 대시보드
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
          /* 조회 실패를 "내역 없음"으로 표시하면 DB가 빈 것으로 오인하게 됩니다.
             관리자 권한이 없거나 Firestore 규칙에 막힌 경우가 여기로 옵니다. */
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
                    {/* Firestore Timestamp 객체를 JS Date로 변환 후 렌더링 */}
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
                    <span className="text-text-muted mb-2 block text-xs font-bold">
                      📝 세부사항
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
                        // 🚨 수정 포인트: reportId와 battletag를 묶어서 객체로 전송
                        deleteReport({
                          reportId: report.id,
                          battletag: report.battletag,
                        });
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
