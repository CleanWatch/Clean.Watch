/* src/hooks/queries/useAdminQueries.ts */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

export const useDeleteReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // battletag는 더 이상 넘기지 않습니다. 서버가 신고 문서에서 직접 읽어야
    // 호출부가 엉뚱한 배틀태그의 카운트를 깎는 일을 막을 수 있습니다.
    mutationFn: async ({ reportId }: { reportId: string }) => {
      await deleteReportAndSyncRanking(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      toast.success('신고 내역을 삭제했습니다');
    },
    onError: (error) => {
      console.error('신고 내역 삭제 에러:', error);
      toast.error('삭제에 실패했습니다');
    },
  });
};
