import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebase/firebase';
import { api } from '@/api';
import { useAuthStore } from '@/store';

export interface Report {
  id: string;
  battletag: string;
  reason: string;
  details: string;
  createdAt: Date;
  reporterUid: string;
}

export const useMyReportsQuery = () => {
  const uid = useAuthStore((state) => state.uid);

  return useQuery({
    queryKey: ['myReports', uid],
    queryFn: async (): Promise<Report[]> => {
      if (!uid) throw new Error('인증 정보가 없습니다.');

      const reportsRef = collection(db, 'reports');
      const q = query(reportsRef, where('reporterUid', '==', uid));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          battletag: data.battletag || '알 수 없음',
          reason: data.reason || '기타',
          details: data.details || '',
          reporterUid: data.reporterUid || '',
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        };
      });
    },
    enabled: !!uid,
  });
};

export const useUpdateProfileMutation = () => {
  const { uid } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      username: string;
      battletag?: string | null;
    }) => {
      if (!uid) throw new Error('인증 정보가 없습니다.');

      await api.post('/api/users/update', {
        username: data.username,
        battletag: data.battletag || null,
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', uid] });
      // 배틀태그가 바뀌었을 수 있다. 안 하면 10분간 이전 태그 전적이 남는다.
      queryClient.invalidateQueries({ queryKey: ['myPlayerSummary', uid] });
      toast.success('프로필이 변경되었습니다');
    },
    onError: (error) => {
      console.error('프로필 업데이트 에러:', error);
      // 검사 뒤 그새 누가 가져간 경우
      const code = axios.isAxiosError(error)
        ? (error.response?.data as { error?: string } | undefined)?.error
        : undefined;
      if (code === 'USERNAME_TAKEN') {
        toast.error('이미 사용 중인 닉네임입니다');
      } else if (code === 'BATTLETAG_TAKEN') {
        toast.error('이미 연동된 배틀태그입니다');
      } else {
        toast.error('프로필 변경에 실패했습니다');
      }
    },
  });
};

// 규칙이 users 삭제와 reports 수정을 막고 있어 서버에 맡긴다
export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();
  const { logout: clearAuthStore } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      if (!auth.currentUser) throw new Error('인증 정보가 없습니다.');

      // uid는 본문이 아니라 인터셉터가 붙이는 토큰으로만 전달한다
      await api.post('/api/account/delete', {});
    },
    onSuccess: async () => {
      toast.success('회원 탈퇴가 완료되었습니다', {
        description: '그동안 이용해 주셔서 감사합니다.',
      });

      // 계정은 서버에서 지워졌고, 여기선 브라우저 쪽 흔적만 지운다
      await signOut(auth);
      clearAuthStore();
      queryClient.clear();
      navigate('/', { replace: true });
    },
    onError: (error) => {
      console.error('회원 탈퇴 실패:', error);
    },
  });
};
