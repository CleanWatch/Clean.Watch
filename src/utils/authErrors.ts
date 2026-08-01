/* src/utils/authErrors.ts */

/**
 * Firebase Auth 에러를 사용자에게 보여줄 문구로 변환합니다.
 *
 * 이전에는 모든 로그인 실패를 "이메일 또는 비밀번호가 일치하지 않습니다"로
 * 표시해서, 네트워크 장애나 계정 잠김을 겪는 사용자가 비밀번호만 반복 입력하게 됐습니다.
 *
 * 단, 자격증명 관련 코드는 의도적으로 하나의 문구로 합칩니다.
 * user-not-found를 따로 알려주면 특정 이메일의 가입 여부를 확인하는 수단이 됩니다.
 */
export const getAuthErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string } | null)?.code;

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return '이메일 또는 비밀번호가 일치하지 않습니다.';

    case 'auth/too-many-requests':
      return '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.';

    case 'auth/network-request-failed':
      return '네트워크 연결을 확인해 주세요.';

    // withTimeout이 붙이는 코드. 응답이 오지 않아 우리가 끊은 경우입니다.
    case 'app/timeout':
      return '응답이 지연되고 있습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.';

    case 'auth/user-disabled':
      return '비활성화된 계정입니다. 관리자에게 문의해 주세요.';

    default:
      return '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }
};
