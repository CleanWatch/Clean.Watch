import { useQuery } from '@tanstack/react-query';
import { fetchRanking, type RankingData } from '@/api';

export const useRanking = () => {
  const {
    data: ranking,
    isLoading,
    isError,
  } = useQuery<RankingData[]>({
    queryKey: ['ranking'],
    queryFn: () => fetchRanking(),
    staleTime: 1000 * 60 * 5,
  });

  return { ranking, isLoading, isError };
};

// ['ranking'] 접두라 관리자 삭제 시 전체 랭킹과 같이 무효화된다
export const useRankingPreview = (size: number) => {
  const {
    data: ranking,
    isLoading,
    isError,
  } = useQuery<RankingData[]>({
    queryKey: ['ranking', 'preview', size],
    queryFn: () => fetchRanking(size),
    staleTime: 1000 * 60 * 5,
  });

  return { ranking, isLoading, isError };
};
