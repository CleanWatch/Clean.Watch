import { useQuery, useMutation } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { useAuthStore } from '@/store';
import type { User } from '@/types';
import { checkDuplicate } from '@/api';

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

export const useUser = () => {
  const { uid } = useAuthStore();

  return useQuery<User, Error>({
    queryKey: ['user', uid],
    queryFn: () => fetchUserData(uid!),
    enabled: !!uid,
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
