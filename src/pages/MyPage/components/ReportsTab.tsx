import { useMyReportsQuery } from '@/hooks';

export const ReportsTab = () => {
  const { data: reports, isLoading, isError } = useMyReportsQuery();

  if (isLoading)
    return (
      <div className="text-text-muted py-12">신고 내역 불러오는 중...</div>
    );
  if (isError)
    return (
      <div className="text-danger py-12">신고 내역을 불러오지 못했습니다.</div>
    );
  if (!reports?.length)
    return (
      <div className="text-text-muted py-12">
        아직 접수한 신고 내역이 없습니다.
      </div>
    );

  return (
    <div>
      <div className="mb-6">
        <div className="text-text-muted text-[13px] font-bold tracking-[0.08em]">
          누적 신고 수
        </div>
        <div className="font-display text-text-main mt-1.5 text-[3.5rem] leading-none font-bold tabular-nums">
          {reports.length}
          <span className="text-text-muted ml-1 text-2xl">건</span>
        </div>
      </div>

      <ul className="border-border-main border-b">
        {reports.map((report) => (
          <li
            key={report.id}
            className="border-border-main flex flex-col gap-3 border-t py-5"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-primary min-w-0 truncate text-lg font-bold">
                {report.battletag}
              </span>
              <span className="text-text-muted shrink-0 text-sm">
                {report.createdAt.toLocaleDateString()}
              </span>
            </div>
            <span className="bg-danger/15 text-danger w-fit rounded-full px-3 py-1 text-xs font-bold">
              {report.reason}
            </span>
            {report.details && (
              <p className="text-text-main/80 text-sm break-all whitespace-pre-wrap">
                {report.details}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
