import axios from 'axios';

// 캡챠 에러가 아니면 null. 호출부는 원래 에러 처리를 이어 간다.
export const getCaptchaErrorMessage = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) return null;
  if (!error.config?.url?.includes('/api/verify-captcha')) return null;

  switch (error.response?.status) {
    case 400:
      return '보안 확인이 완료되지 않았습니다. 다시 시도해 주세요.';

    case 403:
      // 대부분 토큰 만료·재사용. 위젯을 다시 풀면 된다.
      return '보안 확인에 실패했습니다. 아래 확인을 다시 진행해 주세요.';

    case 500:
      // 서버 설정 문제라 캡챠를 다시 풀어도 안 된다
      return '보안 확인 서버에 문제가 있습니다. 잠시 후 다시 시도해 주세요.';

    default:
      return null;
  }
};
