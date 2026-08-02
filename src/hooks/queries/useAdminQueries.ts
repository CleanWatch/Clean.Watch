/* src/hooks/queries/useAdminQueries.ts */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { fetchAdminReports, deleteReportAndSyncRanking } from '@/api';

// 서버 데이터 읽기 (전체 신고 내역 조회)
export const useAdminReportsQuery = () => {
  const uid = useAuthStore((state) => state.uid);

  return useQuery({
    queryKey: ['adminReports'],
    queryFn: fetchAdminReports,
    enabled: !!uid,
  });
};

// 서버 데이터 쓰기 (신고 내역 삭제 및 랭킹 동기화)
export const useDeleteReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // battletag는 더 이상 넘기지 않습니다. 서버가 신고 문서에서 직접 읽어야
    // 호출부가 엉뚱한 배틀태그의 카운트를 깎는 일을 막을 수 있습니다.
    mutationFn: async ({ reportId }: { reportId: string }) => {
      await deleteReportAndSyncRanking(reportId);
    },
    onSuccess: () => {
      // 삭제 후 어드민 내역과 홈 랭킹 데이터를 동시에 최신화
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      alert('삭제 완료 및 랭킹 데이터 동기화 성공!');
    },
    onError: (error) => {
      console.error('신고 내역 삭제 에러:', error);
      alert('삭제 중 오류가 발생했습니다.');
    },
  });
};
