import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { useRankingPreview } from '@/hooks';

const PREVIEW_SIZE = 5;

export const HomeRankingPreview = () => {
  const { ranking, isLoading } = useRankingPreview(PREVIEW_SIZE);

  // 막대는 1위 대비 비율. 1위가 0이면 나눗셈이 깨진다.
  const top = ranking?.[0]?.reportCount ?? 0;

  return (
    <section className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between pb-3 sm:pb-4">
        <h2 className="text-text-muted text-[13px] font-bold tracking-[0.08em]">
          신고 많은 배틀태그
        </h2>
        <Link
          to="/ranking"
          className="text-primary hover:text-primary-hover inline-flex min-h-11 items-center text-[13px] transition-colors sm:text-sm"
        >
          전체 랭킹 →
        </Link>
      </div>

      {isLoading ? (
        <p className="border-border-main text-text-muted border-t py-10 text-[15px]">
          랭킹을 불러오는 중입니다...
        </p>
      ) : !ranking ? (
        <p className="border-border-main text-danger border-t py-10 text-[15px]">
          랭킹을 불러오지 못했습니다.
        </p>
      ) : ranking.length === 0 ? (
        <p className="border-border-main text-text-muted border-t py-10 text-[15px]">
          아직 신고된 배틀태그가 없습니다.
        </p>
      ) : (
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
      )}
    </section>
  );
};
