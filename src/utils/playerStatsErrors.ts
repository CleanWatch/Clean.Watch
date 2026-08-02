/* src/utils/playerStatsErrors.ts */

import axios from 'axios';
import type { PlayerStatsErrorCode } from '@/types';

/**
 * 사용자가 취할 수 있는 행동. 문구만으로는 부족해서 함께 돌려줍니다.
 *
 * settings — 배틀태그를 고쳐야 함. 설정 탭으로 보냅니다
 * retry    — 우리 잘못도 사용자 잘못도 아님. 다시 시도하면 풀립니다
 * none     — 버튼으로 해결할 수 없음
 */
export type PlayerStatsErrorAction = 'settings' | 'retry' | 'none';

interface PlayerStatsErrorInfo {
  message: string;
  action: PlayerStatsErrorAction;
}

const BY_CODE: Record<PlayerStatsErrorCode, PlayerStatsErrorInfo> = {
  BATTLETAG_NOT_SET: {
    message: '배틀태그를 등록하면 전적을 볼 수 있어요.',
    action: 'settings',
  },
  // "등록되지 않음"과 구분합니다. 등록은 했는데 값이 잘못된 것이라
  // 같은 문구를 쓰면 사용자는 이미 넣은 값을 또 넣습니다.
  BATTLETAG_INVALID: {
    message: '등록된 배틀태그 형식이 올바르지 않습니다.',
    action: 'settings',
  },
  // 대소문자 안내는 반드시 넣습니다. 상류가 대소문자를 구분하는데
  // 검색 API도 마찬가지라 자동 교정이 불가능합니다. 사용자가 직접 고쳐야 합니다.
  PLAYER_NOT_FOUND: {
    message:
      '해당 배틀태그를 찾을 수 없습니다. 대소문자를 구분하니 게임에 표시된 그대로인지 확인해 주세요.',
    action: 'settings',
  },
  // 상류가 백그라운드로 프로필을 긁어 캐시하므로 잠시 뒤 재시도하면 대개 성공합니다.
  UPSTREAM_TIMEOUT: {
    message: '전적 서버 응답이 느립니다. 잠시 후 다시 시도해 주세요.',
    action: 'retry',
  },
  UPSTREAM_UNAVAILABLE: {
    message: '전적 서버가 혼잡합니다. 잠시 후 다시 시도해 주세요.',
    action: 'retry',
  },
  UPSTREAM_ERROR: {
    message: '전적을 불러오지 못했습니다.',
    action: 'retry',
  },
};

/**
 * /api/stats/me 의 실패를 사용자 문구와 행동으로 변환합니다.
 *
 * captchaErrors.ts와 같이, 관련 없는 에러면 null을 돌려줘서 호출부가 원래 하던
 * 처리를 이어가게 합니다.
 */
export const getPlayerStatsError = (
  error: unknown,
): PlayerStatsErrorInfo | null => {
  if (!axios.isAxiosError(error)) return null;

  // 클라이언트가 먼저 끊은 경우. 서버 코드가 없으므로 코드 기반 분기로는
  // 절대 안 잡힙니다. 상류가 느릴 때 실제로 가장 흔한 실패인데, 이걸 빠뜨리면
  // 일반 문구로 떨어져서 "기다리면 된다"는 안내를 못 하게 됩니다.
  if (error.code === 'ECONNABORTED') {
    return BY_CODE.UPSTREAM_TIMEOUT;
  }

  if (error.response?.status === 401) {
    return { message: '로그인이 만료되었습니다.', action: 'none' };
  }

  const code = (error.response?.data as { error?: string } | undefined)?.error;
  if (code && code in BY_CODE) {
    return BY_CODE[code as PlayerStatsErrorCode];
  }

  return null;
};
