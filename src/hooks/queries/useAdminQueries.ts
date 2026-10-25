import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';
import { fetchAdminReports, deleteReportAndSyncRanking } from '@/api';

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
