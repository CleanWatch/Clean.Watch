// 자격증명 관련 코드는 일부러 한 문구로 합친다. 나누면 이메일 가입 여부가 드러난다.
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

    // withTimeout
    case 'app/timeout':
      return '응답이 지연되고 있습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.';

    case 'auth/user-disabled':
      return '비활성화된 계정입니다. 관리자에게 문의해 주세요.';

    default:
      return '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }
};
