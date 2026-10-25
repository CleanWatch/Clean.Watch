import { PageHeader, RankingList } from '@/components';
import { useRanking } from '@/hooks';

const STATE = 'border-border-main border-t py-12 text-[16px]';

export const Ranking = () => {
  const { ranking, isLoading } = useRanking();

  return (
    <div className="mx-auto w-full max-w-300 grow px-5 sm:px-10">
      <PageHeader
        eyebrow="랭킹"
        title="신고 랭킹"
        description="가장 많이 신고된 배틀태그 순위입니다. 같은 사람이 여러 번 신고해도 1명으로 집계합니다."
      />

      <div className="max-w-190 pb-16 sm:pb-24">
        {isLoading ? (
          <p className={`${STATE} text-text-muted`}>
            랭킹 데이터를 불러오는 중입니다...
          </p>
        ) : !ranking ? (
          <p className={`${STATE} text-danger`}>랭킹을 불러오지 못했습니다.</p>
        ) : ranking.length === 0 ? (
          <p className={`${STATE} text-text-muted`}>
            아직 신고된 배틀태그가 없습니다.
          </p>
        ) : (
          <RankingList ranking={ranking} />
        )}
      </div>
    </div>
  );
};
