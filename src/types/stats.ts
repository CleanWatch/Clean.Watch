/* src/types/stats.ts */

/**
 * /api/stats/me 의 응답 계약.
 *
 * OverFast의 원본 JSON을 그대로 넘기지 않습니다. 넘기면 상류의 snake_case와
 * nullable 중첩이 화면 코드 전체에 박혀서, 상류가 형태를 바꿀 때 화면을 전부
 * 뒤져야 합니다. 서버가 한 번 정규화해서 이 모양으로만 내보냅니다.
 */

export type PlayerRole = 'tank' | 'damage' | 'support' | 'open';

export interface PlayerRankEntry {
  role: PlayerRole;
  division: string;
  tier: number;
  roleIcon: string | null;
  rankIcon: string | null;
  tierIcon: string | null;
}

export interface MyPlayerSummary {
  /** 사용자가 등록한 원본 형태. 예: 'NECROS#32385' */
  battletag: string;

  profile: {
    username: string;
    avatar: string | null;
    namecard: string | null;
    title: string | null;
    endorsementLevel: number | null;
    endorsementIcon: string | null;
    /** ISO 문자열. 상류는 Unix 초로 주므로 서버에서 변환합니다. */
    lastUpdatedAt: string | null;
  };

  /**
   * null이면 경쟁전 기록이 없거나 프로필이 비공개입니다. **실패가 아닙니다.**
   * 프로필 정보는 그대로 있으므로 화면은 카드를 그리고 안내만 덧붙이면 됩니다.
   */
  rank: {
    platform: 'pc' | 'console';
    season: number | null;
    entries: PlayerRankEntry[];
  } | null;
}

/**
 * 실패 상태. 사용자가 **다음에 할 행동이 다르면** 다른 코드를 씁니다.
 *
 * api/verify-captcha.ts에서 설정 오류와 봇 판정을 갈라놓은 것과 같은 원칙입니다.
 * 하나로 뭉치면 "잠시 후 다시 시도"라는 쓸모없는 안내만 남습니다.
 */
export type PlayerStatsErrorCode =
  /** 배틀태그를 등록하지 않음 → 설정 탭으로 */
  | 'BATTLETAG_NOT_SET'
  /** 저장된 값이 형식에 안 맞음 → 설정 탭으로 (미등록과는 원인이 다름) */
  | 'BATTLETAG_INVALID'
  /** 상류가 못 찾음 → 철자 확인. 대소문자를 구분한다는 안내가 필요 */
  | 'PLAYER_NOT_FOUND'
  /** 상류가 느림 → 30초쯤 뒤 재시도하면 대개 성공 */
  | 'UPSTREAM_TIMEOUT'
  /** 상류 혼잡·점검 → 기다리면 풀림 */
  | 'UPSTREAM_UNAVAILABLE'
  /** 상류 고장 → 기다려도 안 됨 */
  | 'UPSTREAM_ERROR';
