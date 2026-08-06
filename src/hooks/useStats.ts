/* src/hooks/useStats.ts */

import { useQuery } from '@tanstack/react-query';
import { fetchHomeStats } from '@/api';

export const useStats = () => {
  // useQuery를 통한 API 함수 실행 & 상태 관리
  const { data, isLoading, isError } = useQuery({
    queryKey: ['homeStats'], // 이 쿼리의 고유 이름표 (캐싱에 사용됨)
    queryFn: fetchHomeStats,
    staleTime: 1000 * 60 * 5, // 5분간 데이터 재요청 없이 캐시된 데이터 사용 (비용 절약)
  });

  return {
    // data가 없으면(로딩중) 기본값 0
    reportCount: data?.reportCount,
    battleTagCount: data?.battleTagCount,
    isLoading,
    isError,
  };
};
