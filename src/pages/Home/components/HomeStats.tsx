import { cn } from '@/utils';

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
    if (value !== undefined) return value;
    if (isLoading) return '...';
    return '-';
  };

  return (
    <div className="mt-8 grid grid-cols-2 gap-3">
      <div
        className={cn(
          'flex h-24 flex-col items-center justify-center rounded-lg',
          'border-border-main bg-bg-card hover:border-primary/50 border transition-all duration-300',
        )}
      >
        <span className="text-text-muted text-[13px] font-medium">
          누적 신고
        </span>
        <span className="text-primary mt-1 text-2xl font-black">
          {show(reportCount)}
        </span>
      </div>

      <div
        className={cn(
          'flex h-24 flex-col items-center justify-center rounded-lg',
          'border-border-main bg-bg-card hover:border-text-muted/50 border transition-all duration-300',
        )}
      >
        <span className="text-text-muted text-[13px] font-medium">
          누적 배틀태그
        </span>
        <span className="text-text-main mt-1 text-2xl font-bold">
          {show(battleTagCount)}
        </span>
      </div>
      {!isLoading && reportCount === undefined && (
        <p className="text-danger col-span-2 text-center text-[12px]">
          통계를 불러오지 못했습니다.
        </p>
      )}
    </div>
  );
};
