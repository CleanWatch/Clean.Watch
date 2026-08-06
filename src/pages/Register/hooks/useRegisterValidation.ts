/* src/pages/Register/hooks/useRegisterValidation.ts */

import {
  getFieldError,
  isValidEmail,
  isValidUsername,
  isValidPassword,
  isValidBattletag,
} from '@/utils';
import { toast } from 'sonner';

// 폼 데이터 타입 정의
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  battletag: string;
}

// 중복 검사 함수 타입 정의 (파라미터로 필드와 값을 받고, boolean을 반환하는 비동기 함수)
type ValidateDuplicateFn = (params: {
  field: 'username' | 'battletag';
  value: string;
}) => Promise<boolean>;

export const checkFormatErrors = (formData: RegisterFormData) => {
  // 1. 객체 할당 오타 수정
  const newErrors = {
    username: '',
    email: '',
    password: '',
    battletag: '',
  };

  newErrors.username = getFieldError(
    formData.username.trim(),
    '닉네임을 입력해 주세요.',
    isValidUsername,
    '닉네임은 특수문자를 제외한 2~12자여야 합니다.',
  );
  newErrors.email = getFieldError(
    formData.email.trim(),
    '이메일을 입력해 주세요.',
    isValidEmail,
    '이메일 형식이 올바르지 않습니다.',
  );
  newErrors.password = getFieldError(
    formData.password,
    '비밀번호를 입력해 주세요.',
    isValidPassword,
    '비밀번호는 최소 6자리 이상이어야 합니다.',
  );
  newErrors.battletag = getFieldError(
    formData.battletag.trim(),
    null,
    isValidBattletag,
    'Battletag 형식이 올바르지 않습니다. (예: 트레이서#1234)',
  );

  const hasError = Object.values(newErrors).some((msg) => msg !== '');

  // 2. return 오타 수정 및 setErrors 제거
  return { newErrors, hasError };
};

// 3. async 앞 할당 연산자(=) 누락 수정
export const checkDuplicateErrors = async (
  formData: RegisterFormData,
  validateDuplicate: ValidateDuplicateFn,
) => {
  const newErrors = { username: '', email: '', password: '', battletag: '' };
  let hasError = false;

  try {
    const isNameDuplicated = await validateDuplicate({
      field: 'username',
      value: formData.username.trim(),
    });

    if (isNameDuplicated) {
      newErrors.username = '이미 누군가 사용 중인 닉네임입니다 😭';
      hasError = true;
    }

    if (formData.battletag.trim()) {
      const isTagDuplicated = await validateDuplicate({
        field: 'battletag',
        value: formData.battletag.trim(),
      });

      if (isTagDuplicated) {
        newErrors.battletag = '이미 누군가 연동한 배틀태그입니다 😭';
        hasError = true;
      }
    }

    // setErrors 대신 결과값 반환
    return { newErrors, hasError };
  } catch (error) {
    console.error('중복 검사 중 오류 발생:', error);
    toast.error('서버와 통신 중 문제가 발생했습니다', {
      description: '잠시 후 다시 시도해 주세요.',
    });
    return { newErrors, hasError: true };
  }
};
