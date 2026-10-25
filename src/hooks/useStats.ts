import { useQuery } from '@tanstack/react-query';
import { fetchHomeStats } from '@/api';

export const useStats = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['homeStats'],
    queryFn: fetchHomeStats,
    staleTime: 1000 * 60 * 5,
  });

  return {
    reportCount: data?.reportCount,
    battleTagCount: data?.battleTagCount,
    isLoading,
    isError,
  };
};
