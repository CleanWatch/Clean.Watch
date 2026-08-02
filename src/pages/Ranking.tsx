// src/pages/Ranking.tsx

import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { useRanking } from '@/hooks';

export const Ranking = () => {
  const { ranking, isLoading } = useRanking();

  return (
    // 모바일 주소창 꿀렁임 방지 및 세로 배치 레이아웃
    <div className="flex min-h-[calc(100dvh-160px)] w-full flex-col items-center px-5 py-12 sm:px-10">
      {/* 상단 헤더 및 홈 버튼 영역 */}
      <div className="mb-12 text-center">
        <h1 className="text-text-main mb-2 text-[2.5rem] font-black tracking-tight sm:text-[3rem]">
          🏆 신고 랭킹
        </h1>
        <p className="text-text-muted mb-8 text-[16px] sm:text-[18px]">
          가장 많이 신고된 배틀태그 순위
        </p>

        {/* Link 태그 자체에 버튼 스타일링 */}
        <Link
          to="/"
          className={cn(
            'border-border-main bg-bg-card inline-flex items-center justify-center rounded-xl border px-6 py-3',
            'text-text-main text-[15px] font-bold transition-all duration-200',
            'hover:bg-border-main hover:text-white active:scale-95',
          )}
        >
          ← 홈으로
        </Link>
      </div>

      {/* 랭킹 리스트 컨테이너 */}
      <div className="w-full max-w-212.5">
        {isLoading ? (
          <div className="text-text-muted flex min-h-75 items-center justify-center text-[16px] sm:text-[18px]">
            랭킹 데이터를 불러오는 중입니다...
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5">
            {ranking.map((player, index) => (
              <div
                key={player.id}
                className={cn(
                  'border-border-main bg-bg-card flex items-center rounded-2xl border shadow-lg transition-all duration-300',
                  'px-5 py-6 sm:px-8 sm:py-7',
                  // ✨ 기존 CSS의 .ranking-card:hover 효과를 Tailwind로 이식
                  'hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50',
                )}
              >
                {/* 🥇 등수 (메달) 영역 */}
                <div className="flex w-15 justify-center text-[2.2rem] sm:w-20 sm:text-[2.8rem]">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && (
                    <span className="text-text-muted text-[1.4rem] font-bold sm:text-[1.8rem]">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* 👤 유저 정보 영역 */}
                <div className="ml-4 flex flex-col sm:ml-6">
                  <h2 className="text-text-main text-[1.2rem] font-bold sm:text-[1.5rem]">
                    {player.battletag}
                  </h2>
                  <p className="text-text-muted mt-1 text-[15px] sm:text-[16px]">
                    🚨 신고{' '}
                    <span className="text-danger font-bold">
                      {player.reportCount}
                    </span>
                    회
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
