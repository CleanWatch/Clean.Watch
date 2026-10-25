import { useState } from 'react';
import { toast } from 'sonner';
import {
  getAuthErrorMessage,
  getCaptchaErrorMessage,
  isValidEmail,
} from '@/utils';
import { useEmailLoginMutation } from '@/hooks';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { api } from '@/api';

const CAPTCHA_THRESHOLD = 5;

// 캡챠가 풀리면 이 문구일 때만 지운다. 실패 사유까지 지우면 위젯이 자동 통과하면서
// 방금 띄운 실패 문구를 덮어버린다.
const CAPTCHA_PROMPT = '안전한 환경인지 확인 중입니다..';
const MODAL_CAPTCHA_PROMPT = '로봇이 아님을 인증해 주세요.';

// 새로고침해도 캡챠가 유지되도록 sessionStorage에 둔다. UX 장치일 뿐,
// 실제 차단은 Firebase Auth의 too-many-requests가 한다.
const FAILED_ATTEMPTS_KEY = 'login:failedAttempts';

const readFailedAttempts = (): number => {
  const parsed = Number(sessionStorage.getItem(FAILED_ATTEMPTS_KEY));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
};

export const useLoginForm = () => {
  const { mutate: login, isPending, error } = useEmailLoginMutation();

  const [formData, setFormData] = useState(() => ({
    email: localStorage.getItem('savedEmail') || '',
    password: '',
    keepLoggedIn: false,
    rememberEmail: !!localStorage.getItem('savedEmail'),
  }));

  const [uiState, setUiState] = useState(() => ({
    failedAttempts: readFailedAttempts(),
    localError: '',
    // 모달과 토큰을 공유하면 모달에서 푼 캡챠가 로그인 관문까지 연다
    captchaToken: null as string | null,
    // Turnstile 토큰은 1회용이라 key를 바꿔 위젯을 다시 그린다
    captchaKey: 0,
  }));

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
    if (formData.rememberEmail) {
      localStorage.setItem('savedEmail', formData.email);
    } else {
      localStorage.removeItem('savedEmail');
    }

    login(
      {
        email: formData.email,
        password: formData.password,
        keepLoggedIn: formData.keepLoggedIn,
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
              // 실패한 시도에서 토큰이 소모됐다
              captchaToken: null,
              captchaKey: prev.captchaKey + 1,
              // 캡챠 탓이 아니면 errorMessage가 Firebase 에러를 보여준다
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
    // 남의 주소로 메일을 보내게 만드는 동작이라 캡챠를 실제로 검사한다
    if (!modalState.captchaToken) {
      return setModalState((prev) => ({
        ...prev,
        error: MODAL_CAPTCHA_PROMPT,
      }));
    }

    setModalState((prev) => ({ ...prev, isResetting: true, error: '' }));

    try {
      await api.post('/api/verify-captcha', {
        captchaToken: modalState.captchaToken,
      });
      await sendPasswordResetEmail(auth, modalState.email);
      toast.success('비밀번호 재설정 링크를 보냈습니다', {
        description: '메일함을 확인해 주세요.',
      });
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
        // 성공이든 실패든 토큰은 소모됐다
        captchaToken: null,
        captchaKey: prev.captchaKey + 1,
      }));
    }
  };

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
