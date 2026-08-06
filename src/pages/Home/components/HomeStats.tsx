import { cn } from '@/utils';

// 부모(Home)가 데이터를 패칭해서 내려주도록 Props 정의
// 통계 숫자는 포맷팅(예: "1,234")되어 넘어올 수 있으므로 string도 허용
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
  // 숫자 자리에 무엇을 넣을지 한 곳에서 정함
  // 실패 시 0을 보여주면 신고가 없는 상태로 읽히므로, 숫자를 내보내지 않음

  const show = (value?: number) => {
    if (value !== undefined) return value;
    if (isLoading) return '...';
    return '-';
  };

  return (
    // HomeMenu와 통일감 있는 Grid 레이아웃 적용
    <div className="mt-8 grid grid-cols-2 gap-3">
      {/* 누적 신고 (메인 지표) */}
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

      {/* 누적 배틀태그 (서브 지표) */}
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
      {/* 실패 시 출력할 메시지 */}
      {!isLoading && reportCount === undefined && (
        <p className="text-danger col-span-2 text-center text-[12px]">
          통계를 불러오지 못했습니다.
        </p>
      )}
    </div>
  );
};
