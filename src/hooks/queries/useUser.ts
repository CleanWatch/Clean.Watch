// src/hooks/queries/useUser.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { useAuthStore } from '@/store';
import type { User } from '@/types';
import { checkDuplicate } from '@/api';

// Repository 계층: Firestore 데이터 패칭
const fetchUserData = async (uid: string): Promise<User> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('유저 정보가 없습니다.');
  }

  const data = docSnap.data();

  return {
    uid: data.uid,
    username: data.username,
    photoUrl: data.photoUrl ?? '',
    role: data.role ?? 'user',
    battletag: data.battletag || null,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? '',
  } as User;
};

// Custom Query Hook
export const useUser = () => {
  const { uid } = useAuthStore();

  return useQuery<User, Error>({
    queryKey: ['user', uid],
    queryFn: () => fetchUserData(uid!),

    // uid가 있을 때(로그인 상태)만 API를 호출하여 네트워크 낭비 차단
    enabled: !!uid,

    // 가져온 데이터는 5분 동안 신선(stale)한 것으로 간주하여 중복 호출 방지
    staleTime: 1000 * 60 * 5,
  });
};

export const useCheckDuplicate = () => {
  const mutation = useMutation({
    mutationFn: checkDuplicate,
  });

  return {
    validateDuplicate: mutation.mutateAsync,
    isChecking: mutation.isPending,
  };
};
