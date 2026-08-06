/* src/hooks/queries/useRanking.ts */

import { useQuery } from '@tanstack/react-query';
import { fetchRanking, type RankingData } from '@/api';

export const useRanking = () => {
  const {
    data: ranking, // undefined 방지를 위한 기본값 빈 배열
    isLoading,
    isError,
  } = useQuery<RankingData[]>({
    queryKey: ['ranking'],
    queryFn: fetchRanking,
    staleTime: 1000 * 60 * 5, // 5분 캐싱 (비용 최적화)
  });

  return { ranking, isLoading, isError };
};
