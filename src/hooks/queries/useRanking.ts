import { useQuery } from '@tanstack/react-query';
import { fetchRanking, type RankingData } from '@/api';

export const useRanking = () => {
  const {
    data: ranking,
    isLoading,
    isError,
  } = useQuery<RankingData[]>({
    queryKey: ['ranking'],
    queryFn: fetchRanking,
    staleTime: 1000 * 60 * 5,
  });

  return { ranking, isLoading, isError };
};
