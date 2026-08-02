/* src/utils/captchaErrors.ts */

import axios from 'axios';

/**
 * /api/verify-captcha 의 실패 응답을 사용자 문구로 변환합니다.
 *
 * 캡챠 에러가 아니면 null을 돌려주므로, 호출부는 이 값이 있을 때만
 * 캡챠 문구를 쓰고 없으면 원래 하던 에러 처리를 이어가면 됩니다.
 *
 * 서버가 설정 오류(500)와 봇 판정(403)을 갈라서 주는 이유가 여기에 있습니다.
 * 둘을 같은 문구로 보여주면, 우리 환경변수가 빠진 상황에서 사용자는
 * 자기가 봇으로 의심받는 줄 알고 캡챠만 반복해서 풀게 됩니다.
 */
export const getCaptchaErrorMessage = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) return null;
  if (!error.config?.url?.includes('/api/verify-captcha')) return null;

  switch (error.response?.status) {
    case 400:
      return '보안 확인이 완료되지 않았습니다. 다시 시도해 주세요.';

    case 403:
      // 토큰 만료·재사용이 대부분입니다. 위젯을 새로 풀면 해결됩니다.
      return '보안 확인에 실패했습니다. 아래 확인을 다시 진행해 주세요.';

    case 500:
      // 우리 쪽 문제입니다. 사용자가 다시 풀어도 달라지지 않으므로
      // 캡챠를 탓하지 않는 문구를 씁니다.
      return '보안 확인 서버에 문제가 있습니다. 잠시 후 다시 시도해 주세요.';

    default:
      return null;
  }
};
