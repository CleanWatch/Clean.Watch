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

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '@/firebase/firebase';
import { useAuthStore } from '@/store';
import { checkDuplicate } from '@/api';
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

      // 2. 닉네임 중복 체크 (서버 조회)
      // 폼 검증에서 이미 한 번 확인하지만, 그 사이에 남이 같은 닉네임으로
      // 가입했을 수 있어 제출 직전에 다시 봅니다.
      // 예전에는 여기서 users 컬렉션을 직접 쿼리했습니다. 그러려면 규칙에서
      // users 읽기를 열어야 했고, 규칙은 필드를 가릴 수 없어 email까지 함께
      // 노출됐습니다. 지금은 서버가 boolean만 돌려줍니다.
      const isNameTaken = await checkDuplicate({
        field: 'username',
        value: username,
      });
      if (isNameTaken) {
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
      captchaToken,
    }: {
      email: string;
      password: string;
      keepLoggedIn: boolean;
      captchaToken?: string | null;
    }) => {
      // 캡챠 검증. 예전에는 useLoginForm이 토큰의 존재 여부만 보고
      // 서버로는 보내지 않아, 콘솔에서 아무 문자열이나 채워 넣으면 통과했습니다.
      //
      // 다만 이 검증은 우리 화면을 쓰는 사람에게만 유효합니다.
      // signInWithEmailAndPassword는 브라우저에서 구글 서버로 직접 가므로
      // 우리 서버는 그 경로에 없습니다. 로그인 자체를 지키려면
      // Firebase Auth 쪽 봇 방어를 켜야 합니다.
      if (captchaToken) {
        await axios.post('/api/verify-captcha', { captchaToken });
      }

      // 로그인 유지 여부에 따른 세션 지속성 설정
      const persistenceType = keepLoggedIn
        ? browserLocalPersistence
        : browserSessionPersistence;

      // 로그인 절차 전체를 하나의 제한 시간으로 묶습니다.
      // signInWithEmailAndPassword만 감싸면, 그 앞의 setPersistence가 멈췄을 때
      // 두 번째 호출에 도달하지 못해 타임아웃이 발동할 기회조차 없습니다.
      // 응답이 오지 않아도 SDK는 스스로 포기하지 않으므로, 버튼이
      // "로그인 중..."에 갇힌 채 취소도 원인 파악도 불가능해집니다.
      // 서버(api/auth/discord/callback.ts)와 같은 10초 수준을 맞춥니다.
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
