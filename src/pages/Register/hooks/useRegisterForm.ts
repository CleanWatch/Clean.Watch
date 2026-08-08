/* src/pages/Register/hooks/useRegisterForm.ts */

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
  /**
   * 약관·방침 동의 및 연령 확인.
   *
   * 개인정보 수집에는 동의가 필요하고, 만 14세 미만은 가입할 수 없습니다.
   * 앱이 나이를 확인할 방법은 없으니 자기신고로 받되, 약관에 문구만 두고
   * 아무것도 묻지 않으면 **받은 적이 없는 것과 같으므로** 필수 체크로 둡니다.
   */
  const [agreed, setAgreed] = useState(false);

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

    // 태그를 고쳤으면 앞선 경고는 그 값에 대한 것이 아닙니다. 남겨두면 새 값이
    // 확인도 안 된 채 경고만 붙은 것처럼 보입니다.
    if (field === 'battletag') clearWarning();
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

    // 관문 3: 배틀태그 실존 확인 (선택 항목이라 비어 있으면 건너뜁니다)
    //
    // 캡챠보다 앞에 둡니다. 캡챠 토큰은 1회용이라, 여기서 경고로 멈췄다가 다시
    // 누르면 이미 쓴 토큰이 되어 가입이 실패합니다.
    if (!(await shouldProceed(formData.battletag))) return;

    // 관문 4: 동의 확인
    if (!agreed) {
      toast.warning('이용약관과 개인정보처리방침에 동의해 주세요');
      return;
    }

    // 관문 5: 봇 검사
    if (!captchaToken) {
      toast.warning('로봇이 아님을 인증해 주세요');
      return;
    }

    // 관문 6: 최종 회원가입 진행
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
    agreed,
    setAgreed,
    captchaToken,
    setCaptchaToken,
    captchaKey,
    isRegistering,
    isChecking,
    isVerifying,
    // 경고 문구는 화면이 아니라 여기서 정합니다. 두 화면이 같은 문장을 써야 합니다.
    battletagWarning: isBattletagWarning ? BATTLETAG_NOT_FOUND_WARNING : '',
  };
};
