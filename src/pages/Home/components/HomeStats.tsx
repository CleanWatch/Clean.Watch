interface HomeStatsProps {
  reportCount?: number; // 값이 없을 수 있으니 ?
  battleTagCount?: number;
  isLoading: boolean;
}

export const HomeStats = ({
  reportCount,
  battleTagCount,
  isLoading,
}: HomeStatsProps) => {
  // 실패 시 0을 보여주면 신고가 없는 걸로 읽혀서 숫자를 비운다

  const show = (value?: number) => {
    if (value !== undefined) return value.toLocaleString('ko-KR');
    if (isLoading) return '...';
    return '-';
  };

  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-1 lg:gap-10">
      <div>
        <div className="text-text-muted text-[13px] font-bold tracking-[0.08em]">
          누적 신고
        </div>
        <div className="font-display text-primary mt-1.5 text-[3.5rem] leading-none font-bold tabular-nums lg:mt-2 lg:text-[5.25rem]">
          {show(reportCount)}
        </div>
      </div>

      <div>
        <div className="text-text-muted text-[13px] font-bold tracking-[0.08em]">
          누적 배틀태그
        </div>
        <div className="font-display text-text-main mt-1.5 text-[3.5rem] leading-none font-bold tabular-nums lg:mt-2 lg:text-[5.25rem]">
          {show(battleTagCount)}
        </div>
      </div>

      {!isLoading && reportCount === undefined && (
        <p className="text-danger col-span-2 text-[12px] lg:col-span-1">
          통계를 불러오지 못했습니다.
        </p>
      )}
    </div>
  );
};
