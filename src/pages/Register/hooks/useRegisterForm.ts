/* src/pages/Register/hooks/useRegisterForm.ts */

import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation, useCheckDuplicate } from '@/hooks';
import { getCaptchaErrorMessage } from '@/utils';
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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // 위젯을 다시 그리게 하는 값. Turnstile 토큰은 1회용이라 실패하면
  // 같은 토큰으로 재시도해도 계속 거부됩니다.
  const [captchaKey, setCaptchaKey] = useState(0);

  // 폼 상태 관리 (타입 지정)
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    battletag: '',
  });

  // 에러 상태 관리
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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 관문 1: 동기적 정규식/형식 검증
    const formatResult = checkFormatErrors(formData);
    setErrors(formatResult.newErrors);
    if (formatResult.hasError) return;

    // 관문 2: 중복 검사 (비동기)
    const duplicateResult = await checkDuplicateErrors(
      formData,
      validateDuplicate,
    );
    setErrors(duplicateResult.newErrors);
    if (duplicateResult.hasError) return;

    // 관문 3: 봇 검사
    if (!captchaToken) {
      toast.warning('로봇이 아님을 인증해 주세요');
      return;
    }

    // 관문 4: 최종 회원가입 진행
    try {
      await executeRegister({
        email: formData.email,
        password: formData.password,
        username: formData.username.trim(),
        battletag: formData.battletag.trim(),
        captchaToken,
      });
      toast.success('회원가입이 완료되었습니다');
      navigate('/login');
    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error('회원가입 중 오류 발생:', error);

      // 통과했던 에러 바구니를 복사해와서 API 에러 메시지만 추가
      const finalErrors = { ...duplicateResult.newErrors };

      // 캡챠가 거절되면 예전에는 여기서 걸리는 분기가 없어, 화면에 아무
      // 변화가 없었습니다. 사용자는 가입 버튼이 먹통이라고 느낍니다.
      const captchaMessage = getCaptchaErrorMessage(error);

      if (captchaMessage) {
        toast.error(captchaMessage);
        // 소모된 토큰을 비우고 위젯을 새로 띄웁니다.
        setCaptchaToken(null);
        setCaptchaKey((prev) => prev + 1);
      } else if (err.code === 'auth/email-already-in-use') {
        finalErrors.email = '이미 가입된 이메일입니다.';
      } else if (err.message === 'already-in-use-username') {
        finalErrors.username = '이미 사용 중인 닉네임입니다 😭';
      }
      setErrors(finalErrors);
    }
  };

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    captchaToken,
    setCaptchaToken,
    captchaKey,
    isRegistering,
    isChecking,
  };
};
