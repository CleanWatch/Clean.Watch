import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from 'firebase/auth';

import { auth } from '@/firebase/firebase';
import { useAuthStore } from '@/store';
import { checkDuplicate, api } from '@/api';
import { withTimeout } from '@/utils';

// Axios 에러와 Firebase 에러를 같이 받는다
interface AuthError extends Error {
  code?: string;
  response?: {
    status: number;
  };
}

// 폼이 이미 쓰는 에러 메시지로 맞춰, 서버 409도 같은 경로로 필드에 표시한다
const toRegisterError = (error: unknown) => {
  const code = axios.isAxiosError(error)
    ? (error.response?.data as { error?: string } | undefined)?.error
    : undefined;

  if (code === 'USERNAME_TAKEN') return new Error('already-in-use-username');
  if (code === 'BATTLETAG_TAKEN') return new Error('already-in-use-battletag');
  return error;
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
      username,
      battletag,
      captchaToken,
    }: Record<string, string>) => {
      await api.post('/api/verify-captcha', { captchaToken });

      // 폼 검증 이후 그새 누가 가져갔을 수 있어 제출 직전에 한 번 더 본다
      const isNameTaken = await checkDuplicate({
        field: 'username',
        value: username,
      });
      if (isNameTaken) {
        throw new Error('already-in-use-username');
      }

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      try {
        await api.post('/api/users/create', { username, battletag });
      } catch (error) {
        // 프로필 없는 계정이 남으면 같은 이메일로 다시 가입할 수 없다
        await user.delete().catch(() => undefined);
        throw toRegisterError(error);
      }

      await sendEmailVerification(user);

      return user;
    },
    onError: (error: AuthError) => {
      console.error('회원가입 에러:', error);
      if (error.response?.status === 403) {
        toast.error('비정상적인 접근으로 의심되어 차단되었습니다');
      } else if (
        error.code !== 'auth/email-already-in-use' &&
        error.message !== 'already-in-use-username' &&
        error.message !== 'already-in-use-battletag'
      ) {
        toast.error('회원가입 중 오류가 발생했습니다', {
          description: '잠시 후 다시 시도해 주세요.',
        });
      }
    },
  });
};

export const useEmailLoginMutation = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      keepLoggedIn,
      captchaToken,
    }: {
      email: string;
      password: string;
      keepLoggedIn: boolean;
      captchaToken?: string | null;
    }) => {
      // 우리 화면에서만 유효한 검사다. signInWithEmailAndPassword는 브라우저에서
      // 구글로 직접 가므로, 로그인 자체를 지키려면 Firebase Auth 봇 방어가 필요하다.
      if (captchaToken) {
        await api.post('/api/verify-captcha', { captchaToken });
      }

      const persistenceType = keepLoggedIn
        ? browserLocalPersistence
        : browserSessionPersistence;

      // setPersistence가 멈춰도 걸리도록 전체를 한 타임아웃으로 감싼다.
      // SDK는 스스로 포기하지 않아 버튼이 "로그인 중..."에 갇힌다.
      const userCredential = await withTimeout(
        (async () => {
          await setPersistence(auth, persistenceType);
          return signInWithEmailAndPassword(auth, email, password);
        })(),
      );
      return userCredential.user;
    },
    onSuccess: (user) => {
      setAuth(user.uid);
      navigate('/');
    },
    onError: (error: AuthError) => {
      // 화면 문구는 useLoginForm이 만든다
      console.error('로그인 에러:', error);
    },
  });
};

export const handleDiscordLogin = () => {
  window.location.href = '/api/auth/discord';
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const { logout: clearAuthStore } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await signOut(auth);
    },
    onSuccess: () => {
      clearAuthStore();
      // 다음 사용자에게 이전 데이터가 보이지 않게 캐시를 전부 비운다
      queryClient.clear();
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.error('로그아웃 실패:', error);
    },
  });
};
