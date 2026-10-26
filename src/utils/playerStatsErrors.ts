import axios from 'axios';
import type { PlayerStatsErrorCode } from '@/types';

/**
 * settings: 배틀태그를 고쳐야 함 (설정 탭으로)
 * retry: 다시 시도하면 풀림
 * none: 버튼으로 해결 불가
 */
type PlayerStatsErrorAction = 'settings' | 'retry' | 'none';

interface PlayerStatsErrorInfo {
  message: string;
  action: PlayerStatsErrorAction;
}

const BY_CODE: Record<PlayerStatsErrorCode, PlayerStatsErrorInfo> = {
  BATTLETAG_NOT_SET: {
    message: '배틀태그를 등록하면 전적을 볼 수 있어요.',
    action: 'settings',
  },
  BATTLETAG_INVALID: {
    message: '등록된 배틀태그 형식이 올바르지 않습니다.',
    action: 'settings',
  },
  // 오타와 비공개 프로필 둘 다 404라 서버가 구분 못 한다. 한 문구로 둘 다 안내한다.
  PLAYER_NOT_FOUND: {
    message:
      '오버워치에서 이 배틀태그를 찾을 수 없습니다. 대소문자 구분, 인게임 프로필의 공개 여부를 확인해 주세요. (공개 설정: 인게임 설정 → 소셜)',
    action: 'settings',
  },
  // 상류가 백그라운드로 캐시하므로 잠시 뒤엔 대개 성공한다
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

// 마이페이지 전적 카드와 같은 문구를 써야 같은 문제로 읽힌다
export const BATTLETAG_NOT_FOUND_WARNING = `${BY_CODE.PLAYER_NOT_FOUND.message} 그대로 저장하려면 한 번 더 누르세요.`;

// 200인데 본문 모양이 다를 때 (/api/ 경로가 SPA 폴백에 먹혀 index.html이 온 적이 있다)
export class InvalidPlayerStatsError extends Error {
  constructor() {
    super('전적 응답 형식이 올바르지 않습니다.');
    this.name = 'InvalidPlayerStatsError';
  }
}

// 관련 없는 에러면 null
export const getPlayerStatsError = (
  error: unknown,
): PlayerStatsErrorInfo | null => {
  if (error instanceof InvalidPlayerStatsError) return BY_CODE.UPSTREAM_ERROR;

  if (!axios.isAxiosError(error)) return null;

  // 클라이언트가 먼저 끊으면 서버 코드가 없다. 상류가 느릴 때 가장 흔한 실패.
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
