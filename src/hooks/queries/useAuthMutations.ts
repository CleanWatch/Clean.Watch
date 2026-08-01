/* src/hooks/queries/useAuthMutations.ts */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDocs,
  query,
  collection,
  where,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '@/firebase/firebase';
import { useAuthStore } from '@/store';
import { withTimeout } from '@/utils';
import type { UserRole } from '@/types';

// 커스텀 에러 인터페이스 (Axios 에러와 Firebase 에러 동시 호환)
interface AuthError extends Error {
  code?: string;
  response?: {
    status: number;
  };
}

// 1. 회원가입 (Register) 파이프라인
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
      username,
      battletag,
      captchaToken,
    }: Record<string, string>) => {
      // 1. 캡챠 검증 (BFF 서버리스 통신)
      await axios.post('/api/verify-captcha', { captchaToken });

      // 2. 닉네임 중복 체크 (Firestore 쿼리)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error('already-in-use-username'); // 커스텀 에러 던지기
      }

      // 3. 파이어베이스 Auth 생성
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // 이메일 인증 발송 및 Firestore 메타데이터 저장을 동시에 실행 (성능 극대화)
      await Promise.all([
        sendEmailVerification(user),
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email,
          username,
          battletag: battletag || null,
          photoUrl: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
          role: 'user' as UserRole,
          createdAt: serverTimestamp(),
        }),
      ]);

      return user;
    },
    onError: (error: AuthError) => {
      console.error('회원가입 에러:', error);
      if (error.response?.status === 403) {
        alert('비정상적인 접근으로 의심되어 차단되었습니다.');
      } else if (
        error.code !== 'auth/email-already-in-use' &&
        error.message !== 'already-in-use-username'
      ) {
        alert('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    },
  });
};

// 2. 로그인 (Login) 파이프라인
export const useEmailLoginMutation = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      keepLoggedIn,
    }: {
      email: string;
      password: string;
      keepLoggedIn: boolean;
    }) => {
      // 로그인 유지 여부에 따른 세션 지속성 설정
      const persistenceType = keepLoggedIn
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistenceType);

      // 파이어베이스 Auth 로그인
      // 응답이 오지 않으면 SDK가 스스로 포기하지 않아 버튼이 "로그인 중..."에
      // 갇힙니다. 서버(api/auth/discord/callback.ts)와 같은 10초 제한을 둡니다.
      const userCredential = await withTimeout(
        signInWithEmailAndPassword(auth, email, password),
      );
      return userCredential.user;
    },
    onSuccess: (user) => {
      setAuth(user.uid);
      // Zustand 상태 관리는 src/hooks/useAuthListener.ts 가 자동으로 감지해서 처리하므로 라우팅만 함
      navigate('/');
    },
    onError: (error: AuthError) => {
      // 사용자에게 보여줄 문구는 useLoginForm이 getAuthErrorMessage로 파생시킵니다.
      // 여기서는 원본 에러만 남겨 디버깅에 쓰도록 합니다.
      console.error('로그인 에러:', error);
    },
  });
};

// 3. 디스코드 로그인 핸들러 (서버리스 BFF 위임)
export const handleDiscordLogin = () => {
  // 클라이언트에서 ID를 섞어 조합하지 않고 서버리스 엔드포인트로 보냄
  window.location.href = '/api/auth/discord';
};

// 4. 로그아웃 (Logout) 파이프라인
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const { logout: clearAuthStore } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await signOut(auth);
    },
    onSuccess: () => {
      clearAuthStore(); // Zustand 세션 비우기
      queryClient.clear(); // React Query 캐시 완벽 소각 (다른 유저 데이터 노출 방지)
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.error('로그아웃 실패:', error);
    },
  });
};
