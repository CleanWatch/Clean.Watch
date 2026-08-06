/* src/hooks/queries/useMyPageQueries.ts */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebase/firebase';
import { api } from '@/api';
import { useAuthStore } from '@/store';

// 신고 내역 타입 정의
export interface Report {
  id: string;
  battletag: string;
  reason: string;
  details: string;
  createdAt: Date;
  reporterUid: string; // 신고를 작성한 유저의 UID
}

// Mock 함수 삭제: Firestore 실데이터 쿼리
export const useMyReportsQuery = () => {
  const uid = useAuthStore((state) => state.uid);

  return useQuery({
    queryKey: ['myReports', uid],
    queryFn: async (): Promise<Report[]> => {
      if (!uid) throw new Error('인증 정보가 없습니다.');

      // reports 컬렉션 참조
      const reportsRef = collection(db, 'reports');

      // 현재 로그인한 유저(uid)가 작성한 신고 내역만 필터링
      const q = query(reportsRef, where('reporterUid', '==', uid));

      // 데이터 가져오기
      const snapshot = await getDocs(q);

      // 컴포넌트가 사용하기 편하게 데이터 가공
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          battletag: data.battletag || '알 수 없음',
          reason: data.reason || '기타',
          details: data.details || '',
          reporterUid: data.reporterUid || '',
          // 파이어베이스 Timestamp 객체를 JavaScript Date 객체로 변환
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        };
      });
    },
    enabled: !!uid, // uid가 존재할 때만 쿼리 실행
  });
};

// 서버 데이터 쓰기/수정
export const useUpdateProfileMutation = () => {
  const { uid } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      username: string;
      battletag?: string | null;
    }) => {
      if (!uid) throw new Error('인증 정보가 없습니다.');

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        username: data.username,
        battletag: data.battletag || null,
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', uid] });
      // 배틀태그를 바꿨을 수 있습니다. 이걸 빠뜨리면 staleTime(10분) 동안
      // 이전 배틀태그의 전적이 그대로 남습니다.
      queryClient.invalidateQueries({ queryKey: ['myPlayerSummary', uid] });
      toast.success('프로필이 변경되었습니다');
    },
    onError: (error) => {
      console.error('프로필 업데이트 에러:', error);
      toast.error('프로필 변경에 실패했습니다');
    },
  });
};

// 회원 탈퇴
//
// 클라이언트에서는 처리할 수 없습니다. firestore.rules가 users 삭제를 막고 있고
// (allow delete: if false), reports 수정은 관리자만 가능합니다. 그 제한은 옳으므로
// 규칙을 여는 대신 Admin SDK를 쓰는 서버리스 함수에 위임합니다.
export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();
  const { logout: clearAuthStore } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      if (!auth.currentUser) throw new Error('인증 정보가 없습니다.');

      // 서버가 ID 토큰에서 uid를 꺼내 씁니다. 본문으로 uid를 보내면
      // 남의 계정을 지울 수 있으므로, 인터셉터가 붙이는 헤더로만 전달합니다.
      await api.post('/api/account/delete', {});
    },
    onSuccess: async () => {
      toast.success('회원 탈퇴가 완료되었습니다', {
        description: '그동안 이용해 주셔서 감사합니다.',
      });

      // 계정은 이미 서버에서 삭제됐습니다. 여기서는 브라우저에 남은 흔적을 지웁니다.
      // useLogoutMutation과 같은 순서를 따릅니다.
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
