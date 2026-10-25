import { cn } from '@/utils';
import type { RankingData } from '@/api';

interface RankingListProps {
  ranking: RankingData[];
}

export const RankingList = ({ ranking }: RankingListProps) => {
  // 막대는 1위 대비 비율. 1위가 0이면 나눗셈이 깨진다.
  const top = ranking[0]?.reportCount ?? 0;

  return (
    <ol className="border-border-main border-b">
      {ranking.map((player, index) => (
        <li
          key={player.id}
          className="border-border-main flex items-center gap-4 border-t py-4 sm:gap-6 sm:py-5"
        >
          <span
            className={cn(
              'font-display w-8 text-4xl leading-none font-bold tabular-nums sm:w-12 sm:text-[2.75rem]',
              index === 0 ? 'text-primary' : 'text-text-muted',
            )}
          >
            {index + 1}
          </span>

          <div className="min-w-0 grow">
            <div className="text-text-main truncate text-[17px] font-medium sm:text-xl">
              {player.battletag}
            </div>
            <div
              className={cn(
                'mt-2 h-1 rounded-full sm:mt-2.5',
                index === 0 ? 'bg-primary' : 'bg-zinc-600',
              )}
              style={{
                width: top > 0 ? `${(player.reportCount / top) * 100}%` : 0,
              }}
            />
          </div>

          {/* 공개 수치는 건수가 아니라 신고한 사람 수 (이용약관 제4조) */}
          <span className="text-text-muted shrink-0 text-sm sm:text-base">
            {player.reportCount}명
          </span>
        </li>
      ))}
    </ol>
  );
};
