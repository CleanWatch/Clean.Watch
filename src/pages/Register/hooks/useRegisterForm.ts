import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  useRegisterMutation,
  useCheckDuplicate,
  useBattletagVerification,
} from '@/hooks';
import { BATTLETAG_NOT_FOUND_WARNING, getCaptchaErrorMessage } from '@/utils';
import {
  checkFormatErrors,
  checkDuplicateErrors,
  type RegisterFormData,
} from './useRegisterValidation';

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const { mutateAsync: executeRegister, isPending: isRegistering } =
    useRegisterMutation();
  const { validateDuplicate, isChecking } = useCheckDuplicate();
  const {
    isVerifying,
    isWarning: isBattletagWarning,
    shouldProceed,
    clearWarning,
  } = useBattletagVerification();
  // 약관 동의 + 만 14세 이상 자기신고. 묻지 않으면 받은 적이 없는 것과 같다.
  const [agreed, setAgreed] = useState(false);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Turnstile 토큰은 1회용이라 실패하면 key를 바꿔 위젯을 다시 그린다
  const [captchaKey, setCaptchaKey] = useState(0);

  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    battletag: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    battletag: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // 태그를 고쳤으면 이전 경고는 새 값에 대한 게 아니다
    if (field === 'battletag') clearWarning();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formatResult = checkFormatErrors(formData);
    setErrors(formatResult.newErrors);
    if (formatResult.hasError) return;

    const duplicateResult = await checkDuplicateErrors(
      formData,
      validateDuplicate,
    );
    setErrors(duplicateResult.newErrors);
    if (duplicateResult.hasError) return;

    // 캡챠보다 먼저. 경고로 멈췄다 다시 누르면 이미 쓴 토큰이 된다.
    if (!(await shouldProceed(formData.battletag))) return;

    if (!agreed) {
      toast.warning('이용약관과 개인정보처리방침에 동의해 주세요');
      return;
    }

    if (!captchaToken) {
      toast.warning('로봇이 아님을 인증해 주세요');
      return;
    }

    try {
      await executeRegister({
        email: formData.email,
        password: formData.password,
        username: formData.username.trim(),
        battletag: formData.battletag.trim(),
        captchaToken,
      });
      clearWarning();
      toast.success('회원가입이 완료되었습니다');
      navigate('/login');
    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error('회원가입 중 오류 발생:', error);

      const finalErrors = { ...duplicateResult.newErrors };

      const captchaMessage = getCaptchaErrorMessage(error);

      if (captchaMessage) {
        toast.error(captchaMessage);
        setCaptchaToken(null);
        setCaptchaKey((prev) => prev + 1);
      } else if (err.code === 'auth/email-already-in-use') {
        finalErrors.email = '이미 가입된 이메일입니다.';
      } else if (err.message === 'already-in-use-username') {
        finalErrors.username = '이미 사용 중인 닉네임입니다.';
      } else if (err.message === 'already-in-use-battletag') {
        finalErrors.battletag = '이미 연동된 배틀태그입니다.';
      }
      setErrors(finalErrors);
    }
  };

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    agreed,
    setAgreed,
    captchaToken,
    setCaptchaToken,
    captchaKey,
    isRegistering,
    isChecking,
    isVerifying,
    battletagWarning: isBattletagWarning ? BATTLETAG_NOT_FOUND_WARNING : '',
  };
};
