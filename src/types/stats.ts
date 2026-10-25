// /api/stats/me 응답. 상류 JSON을 서버에서 정규화해 이 모양으로만 내보낸다.

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
  battletag: string;

  profile: {
    username: string;
    avatar: string | null;
    namecard: string | null;
    title: string | null;
    endorsementLevel: number | null;
    endorsementIcon: string | null;
    /** ISO */
    lastUpdatedAt: string | null;
  };

  /** null = 경쟁전 기록 없음 또는 비공개. 실패가 아니다. */
  rank: {
    platform: 'pc' | 'console';
    season: number | null;
    entries: PlayerRankEntry[];
  } | null;
}

// 사용자가 다음에 할 행동이 다르면 코드를 나눈다
export type PlayerStatsErrorCode =
  | 'BATTLETAG_NOT_SET'
  | 'BATTLETAG_INVALID'
  | 'PLAYER_NOT_FOUND'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_UNAVAILABLE'
  | 'UPSTREAM_ERROR';
