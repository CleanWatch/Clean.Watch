import { Flag, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { useRanking } from '@/hooks';

export const Ranking = () => {
  const { ranking, isLoading } = useRanking();

  return (
    <div className="flex w-full grow flex-col items-center px-5 py-12 sm:px-10">
      <div className="mb-12 text-center">
        <h1 className="text-text-main mb-2 flex items-center justify-center gap-3 text-[2.5rem] font-black tracking-tight sm:text-[3rem]">
          <Trophy
            className="text-primary shrink-0"
            size={38}
            aria-hidden="true"
          />
          신고 랭킹
        </h1>
        <p className="text-text-muted mb-8 text-[16px] sm:text-[18px]">
          가장 많이 신고된 배틀태그 순위
        </p>

        <Link
          to="/"
          className={cn(
            'border-border-main bg-bg-card inline-flex items-center justify-center rounded-xl border px-6 py-3',
            'text-text-main text-[15px] font-bold transition-all duration-200',
            'hover:bg-border-main hover:text-white active:scale-95',
          )}
        >
          <span aria-hidden="true">←</span>&nbsp;홈으로
        </Link>
      </div>

      <div className="w-full max-w-212.5">
        {isLoading ? (
          <div className="text-text-muted flex min-h-75 items-center justify-center text-[16px] sm:text-[18px]">
            랭킹 데이터를 불러오는 중입니다...
          </div>
        ) : !ranking ? (
          <div className="text-danger flex min-h-75 items-center justify-center text-[16px] sm:text-[18px]">
            랭킹을 불러오지 못했습니다.
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-text-muted flex min-h-75 items-center justify-center text-[16px] sm:text-[18px]">
            아직 신고된 배틀태그가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5">
            {ranking.map((player, index) => (
              <div
                key={player.id}
                className={cn(
                  'border-border-main bg-bg-card flex items-center rounded-2xl border shadow-lg transition-all duration-300',
                  'px-4 py-4 sm:px-6 sm:py-5',
                  'hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50',
                )}
              >
                {/* 순위 칸. 1위 채움, 2·3위 강조색, 4위부터 흰 글자.
                    4위 이하를 회색으로 흐리면 대비가 부족하고 비활성처럼 보인다. */}
                <div
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl',
                    'text-[1.5rem] font-bold tabular-nums',
                    index === 0 ? 'bg-primary text-bg-main' : 'bg-border-main',
                    index > 0 && index < 3 ? 'text-primary' : '',
                    index >= 3 ? 'text-text-main' : '',
                  )}
                >
                  {index + 1}
                </div>

                <h2 className="text-text-main ml-4 flex-1 text-[1.05rem] font-bold sm:ml-5 sm:text-[1.2rem]">
                  {player.battletag}
                </h2>

                {/* 공개 수치는 건수가 아니라 신고한 사람 수 (이용약관 제4조) */}
                <p className="text-text-muted flex shrink-0 items-center gap-1.5 text-[14px]">
                  <Flag
                    className="text-danger shrink-0"
                    size={15}
                    aria-hidden="true"
                  />
                  <span className="text-danger font-bold">
                    {player.reportCount}
                  </span>
                  명
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
