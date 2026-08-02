/* src/hooks/useLoginForm.ts */

import { useState } from 'react';
import {
  getAuthErrorMessage,
  getCaptchaErrorMessage,
  isValidEmail,
} from '@/utils';
import { useEmailLoginMutation } from '@/hooks';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import axios from 'axios';

// 캡챠가 뜨기 시작하는 실패 횟수
const CAPTCHA_THRESHOLD = 5;

/**
 * 캡챠를 아직 풀지 않았을 때의 안내 문구.
 *
 * 캡챠가 풀리면 이 문구는 지워야 하지만, 실패 사유까지 함께 지우면 안 됩니다.
 * 실패 후에는 소모된 토큰 대신 위젯을 새로 띄우는데, 위젯이 자동으로 통과하면
 * onVerify가 바로 불려 방금 띄운 실패 문구를 덮어버리기 때문입니다.
 * 그래서 이 문구일 때만 지웁니다.
 */
const CAPTCHA_PROMPT = '안전한 환경인지 확인 중입니다..';
const MODAL_CAPTCHA_PROMPT = '로봇이 아님을 인증해 주세요.';

/**
 * 실패 횟수를 sessionStorage에 둡니다.
 *
 * 컴포넌트 state로 두면 새로고침 한 번에 0으로 돌아가 캡챠가 사라졌습니다.
 * 다만 이것도 사용자가 지울 수 있는 값이라 방어가 아니라 UX 장치입니다.
 * 실제 차단은 Firebase Auth의 too-many-requests가 담당합니다.
 */
const FAILED_ATTEMPTS_KEY = 'login:failedAttempts';

const readFailedAttempts = (): number => {
  const parsed = Number(sessionStorage.getItem(FAILED_ATTEMPTS_KEY));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
};

export const useLoginForm = () => {
  const { mutate: login, isPending, error } = useEmailLoginMutation();

  // 메인 폼 유저 입력 데이터 묶기
  const [formData, setFormData] = useState(() => ({
    email: localStorage.getItem('savedEmail') || '', // 처음 마운트될 때 한번만 실행됨
    password: '',
    keepLoggedIn: false,
    rememberEmail: !!localStorage.getItem('savedEmail'),
  }));

  // 메인 폼 에러 & 검증 상태 묶기
  const [uiState, setUiState] = useState(() => ({
    failedAttempts: readFailedAttempts(),
    localError: '',
    // 비밀번호 찾기 모달과 토큰을 공유하면, 모달에서 푼 캡챠가 로그인 폼의
    // 관문까지 열어줍니다. 그래서 각자 따로 들고 있습니다.
    captchaToken: null as string | null,
    // 위젯을 다시 그리게 하는 값. Turnstile 토큰은 1회용이라
    // 한 번 쓰고 나면 새로 받아야 합니다.
    captchaKey: 0,
  }));

  // 비밀번호 찾기(모달) 전용 상태 묶기
  const [modalState, setModalState] = useState({
    isOpen: false,
    email: '',
    isResetting: false,
    error: '',
    captchaToken: null as string | null,
    captchaKey: 0,
  });

  const needsCaptcha = uiState.failedAttempts >= CAPTCHA_THRESHOLD;

  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (needsCaptcha && !uiState.captchaToken) {
      return setUiState((prev) => ({
        ...prev,
        localError: CAPTCHA_PROMPT,
      }));
    }

    if (!formData.email || !formData.password) {
      return setUiState((prev) => ({
        ...prev,
        localError: '이메일과 비밀번호를 모두 입력해주세요.',
      }));
    }
    if (!isValidEmail(formData.email)) {
      return setUiState((prev) => ({
        ...prev,
        localError: '올바른 이메일 형식을 입력해 주세요.',
      }));
    }

    setUiState((prev) => ({ ...prev, localError: '' }));
    // 로컬스토리지 이메일 저장
    if (formData.rememberEmail) {
      localStorage.setItem('savedEmail', formData.email);
    } else {
      localStorage.removeItem('savedEmail');
    }

    // 로그인 실행
    login(
      {
        email: formData.email,
        password: formData.password,
        keepLoggedIn: formData.keepLoggedIn,
        // 예전에는 토큰이 있는지만 보고 보내지 않아, 콘솔에서 아무 문자열이나
        // 채워 넣으면 관문이 열렸습니다.
        captchaToken: uiState.captchaToken,
      },
      {
        onSuccess: () => sessionStorage.removeItem(FAILED_ATTEMPTS_KEY),
        onError: (err) => {
          const captchaMessage = getCaptchaErrorMessage(err);

          setUiState((prev) => {
            const next = prev.failedAttempts + 1;
            sessionStorage.setItem(FAILED_ATTEMPTS_KEY, String(next));
            return {
              ...prev,
              failedAttempts: next,
              // 실패한 시도에서 토큰이 이미 소모됐으므로 위젯을 새로 띄웁니다.
              captchaToken: null,
              captchaKey: prev.captchaKey + 1,
              // 캡챠가 원인이면 그 문구를 보여줍니다. 아니면 errorMessage가
              // Firebase 에러를 번역해 화면에 나갑니다.
              localError: captchaMessage ?? prev.localError,
            };
          });
        },
      },
    );
  };

  const handlePasswordReset = async () => {
    if (!modalState.email)
      return setModalState((prev) => ({
        ...prev,
        error: '가입하신 이메일 주소를 입력해 주세요.',
      }));
    if (!isValidEmail(modalState.email)) {
      return setModalState((prev) => ({
        ...prev,
        error: '올바른 이메일 형식을 입력해 주세요.',
      }));
    }
    // 예전에는 모달에 위젯만 띄워놓고 여기서 확인하지 않았습니다.
    // 재설정 메일 발송은 남의 주소로 메일이 가게 만드는 동작이라,
    // 위젯을 띄운 이상 실제로 검사해야 합니다.
    if (!modalState.captchaToken) {
      return setModalState((prev) => ({
        ...prev,
        error: MODAL_CAPTCHA_PROMPT,
      }));
    }

    setModalState((prev) => ({ ...prev, isResetting: true, error: '' }));

    try {
      await axios.post('/api/verify-captcha', {
        captchaToken: modalState.captchaToken,
      });
      await sendPasswordResetEmail(auth, modalState.email);
      alert(
        '비밀번호 재설정 링크가 이메일로 발송되었습니다!\n메일함을 확인해 주세요.',
      );
      setModalState({
        isOpen: false,
        email: '',
        isResetting: false,
        error: '',
        captchaToken: null,
        captchaKey: 0,
      });
    } catch (e) {
      console.error('비밀번호 재설정 실패:', e);
      setModalState((prev) => ({
        ...prev,
        isResetting: false,
        error:
          getCaptchaErrorMessage(e) ??
          '메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        // 성공이든 실패든 토큰은 소모됐습니다.
        captchaToken: null,
        captchaKey: prev.captchaKey + 1,
      }));
    }
  };

  // 캡챠 위젯 핸들러.
  // 상태 모양을 컴포넌트가 직접 만지지 않도록 여기서 감쌉니다.
  const handleCaptchaVerify = (token: string) =>
    setUiState((prev) => ({
      ...prev,
      captchaToken: token,
      localError: prev.localError === CAPTCHA_PROMPT ? '' : prev.localError,
    }));

  const handleCaptchaExpire = () =>
    setUiState((prev) => ({ ...prev, captchaToken: null }));

  const handleModalCaptchaVerify = (token: string) =>
    setModalState((prev) => ({
      ...prev,
      captchaToken: token,
      error: prev.error === MODAL_CAPTCHA_PROMPT ? '' : prev.error,
    }));

  const handleModalCaptchaExpire = () =>
    setModalState((prev) => ({ ...prev, captchaToken: null }));

  // 로그인 실패 원인을 에러 코드에 맞는 문구로 변환.
  // 컴포넌트는 화면에 뿌리기만 하도록 여기서 파생시킵니다.
  const errorMessage = error ? getAuthErrorMessage(error) : '';

  return {
    isPending,
    error,
    errorMessage,
    formData,
    setFormData,
    uiState,
    setUiState,
    needsCaptcha,
    handleCaptchaVerify,
    handleCaptchaExpire,
    handleModalCaptchaVerify,
    handleModalCaptchaExpire,
    modalState,
    setModalState,
    handlePasswordReset,
    onSubmit,
  };
};
