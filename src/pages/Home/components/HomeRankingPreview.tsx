import { Link } from 'react-router-dom';
import { RankingList } from '@/components';
import { useRankingPreview } from '@/hooks';

const PREVIEW_SIZE = 5;

export const HomeRankingPreview = () => {
  const { ranking, isLoading } = useRankingPreview(PREVIEW_SIZE);

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
        <RankingList ranking={ranking} />
      )}
    </section>
  );
};
