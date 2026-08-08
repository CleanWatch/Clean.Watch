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
  // 원인이 둘인데 서버가 구분할 수 없습니다. 상류는 두 경우 모두 404를 줍니다.
  //   1) 배틀태그가 틀림 — 상류가 대소문자를 구분하고 검색 API도 마찬가지라
  //      자동 교정이 불가능합니다. 사용자가 직접 고쳐야 합니다.
  //   2) 커리어 프로필이 비공개 — 실재하는 계정도 404가 됩니다(실측 확인).
  // 그래서 한 문구가 둘을 다 안내해야 합니다. 대소문자만 말하면 비공개 사용자는
  // 멀쩡한 자기 태그를 계속 들여다보게 됩니다.
  PLAYER_NOT_FOUND: {
    message:
      '오버워치에서 이 배틀태그를 찾을 수 없습니다. 대소문자를 구분하니 게임에 표시된 그대로인지, 또는 커리어 프로필이 비공개는 아닌지 확인해 주세요. (공개 설정은 게임 안 옵션 → 소셜)',
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
 * 배틀태그 확인이 "확실히 없음"으로 나왔을 때 폼에 띄우는 경고.
 *
 * 위 `PLAYER_NOT_FOUND` 문구를 그대로 재사용합니다. 같은 상황(비공개이거나 오타)을
 * 마이페이지 전적 카드에서도 만나는데, 거기와 다른 말로 안내하면 사용자는 같은 문제를
 * 두 번 다른 문제로 읽습니다. 뒤에 붙는 한 문장만 폼 전용입니다.
 */
export const BATTLETAG_NOT_FOUND_WARNING = `${BY_CODE.PLAYER_NOT_FOUND.message} 그대로 저장하려면 한 번 더 누르세요.`;

/**
 * 200인데 본문이 우리가 기대한 모양이 아닐 때 던집니다.
 *
 * axios는 상태 코드로만 성공을 판단하므로 이런 응답에 에러를 내지 않습니다. 그러면
 * 화면은 `data`를 믿고 `profile.avatar`를 읽다가 TypeError로 죽습니다.
 * 실제로 `/api/` 경로가 SPA 폴백에 먹혀 index.html이 200으로 온 적이 있습니다.
 */
export class InvalidPlayerStatsError extends Error {
  constructor() {
    super('전적 응답 형식이 올바르지 않습니다.');
    this.name = 'InvalidPlayerStatsError';
  }
}

/**
 * /api/stats/me 의 실패를 사용자 문구와 행동으로 변환합니다.
 *
 * captchaErrors.ts와 같이, 관련 없는 에러면 null을 돌려줘서 호출부가 원래 하던
 * 처리를 이어가게 합니다.
 */
export const getPlayerStatsError = (
  error: unknown,
): PlayerStatsErrorInfo | null => {
  // 우리가 직접 던진 것이라 axios 에러가 아닙니다. 아래 검사보다 먼저 봐야 합니다.
  if (error instanceof InvalidPlayerStatsError) return BY_CODE.UPSTREAM_ERROR;

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
