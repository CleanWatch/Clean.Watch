/* src/hooks/useLoginForm.ts */

import { useState } from 'react';
import { getAuthErrorMessage, isValidEmail } from '@/utils';
import { useEmailLoginMutation } from '@/hooks';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/firebase';

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
  const [uiState, setUiState] = useState({
    failedAttempts: 0,
    localError: '',
    turnstileToken: null as string | null,
  });

  // 비밀번호 찾기(모달) 전용 상태 묶기
  const [modalState, setModalState] = useState({
    isOpen: false,
    email: '',
    isResetting: false,
    error: '',
  });

  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (uiState.failedAttempts >= 5 && !uiState.turnstileToken) {
      return setUiState((prev) => ({
        ...prev,
        localError: '안전한 환경인지 확인 중입니다..',
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
      },
      {
        onError: () =>
          setUiState((prev) => ({
            ...prev,
            failedAttempts: prev.failedAttempts + 1,
          })),
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

    setModalState((prev) => ({ ...prev, isResetting: true, error: '' }));

    try {
      await sendPasswordResetEmail(auth, modalState.email);
      alert(
        '비밀번호 재설정 링크가 이메일로 발송되었습니다!\n메일함을 확인해 주세요.',
      );
      setModalState({
        isOpen: false,
        email: '',
        isResetting: false,
        error: '',
      });
    } catch (e) {
      console.error('비밀번호 재설정 실패:', e);
      setModalState((prev) => ({
        ...prev,
        isResetting: false,
        error: '메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      }));
    }
  };

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
    modalState,
    setModalState,
    handlePasswordReset,
    onSubmit,
  };
};
