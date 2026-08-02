/* src/pages/MyPage/components/ReportsTab.tsx */

import { useMyReportsQuery } from '@/hooks';

export const ReportsTab = () => {
  const { data: reports, isLoading } = useMyReportsQuery();

  if (isLoading)
    return (
      <div className="text-text-muted py-20 text-center">
        신고 내역 불러오는 중...
      </div>
    );
  if (!reports?.length)
    return (
      <div className="text-text-muted py-20 text-center">
        아직 접수한 신고 내역이 없습니다.
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border-main mb-4 inline-flex items-center justify-center gap-3 self-center rounded-xl border bg-white/5 px-6 py-3">
        <span className="text-text-muted font-bold">누적 신고 수</span>
        <span className="text-xl font-black text-blue-400">
          {reports.length} 건
        </span>
      </div>

      {reports.map((report) => (
        <div
          key={report.id}
          className="border-border-main bg-bg-main flex flex-col gap-3 rounded-xl border p-5 transition-transform hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-primary text-lg font-black">
              {report.battletag}
            </span>
            <span className="text-text-muted text-sm">
              {report.createdAt.toLocaleDateString()}
            </span>
          </div>
          <span className="bg-danger/15 text-danger w-fit rounded-full px-3 py-1 text-xs font-bold">
            {report.reason}
          </span>
          <p className="text-text-main/80 text-sm">{report.details}</p>
        </div>
      ))}
    </div>
  );
};
