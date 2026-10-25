import type {
  MyPlayerSummary,
  PlayerRankEntry,
  PlayerRole,
  PlayerStatsErrorCode,
} from '../../src/types/stats.js';

const BASE_URL = 'https://overfast-api.tekrop.fr';

// 클라이언트 타임아웃보다 짧아야 서버가 원인을 담은 상태 코드를 먼저 돌려줄 수 있다
const UPSTREAM_TIMEOUT_MS = 8_000;

// 무료 공개 API라 연락처를 밝혀 둔다. IP 대역 차단 대신 조정할 여지를 남긴다.
const USER_AGENT = 'CleanWatch/1.0 (+https://cleanwatch.cloud)';

const ROLES = ['tank', 'damage', 'support', 'open'] as const;

// src/utils/validations.ts와 같은 정규식. api/는 @/ 별칭을 못 써서 복사했다. 함께 고칠 것.
const BATTLETAG_PATTERN = /^[a-zA-Z가-힣][a-zA-Z0-9가-힣]{1,11}#[0-9]{4,5}$/;

export const isValidBattletag = (tag?: string | null): boolean =>
  !!tag && BATTLETAG_PATTERN.test(tag.trim());

export class OverFastError extends Error {
  // erasableSyntaxOnly라 생성자 파라미터 프로퍼티를 못 쓴다
  readonly status: number;
  readonly code: PlayerStatsErrorCode;

  constructor(status: number, code: PlayerStatsErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'OverFastError';
    this.status = status;
    this.code = code;
  }
}

// 상류 응답 형태 (실측, 필요한 필드만)
interface UpstreamRank {
  division: string;
  tier: number;
  role_icon: string | null;
  rank_icon: string | null;
  tier_icon: string | null;
}

type UpstreamPlatform = {
  season: number | null;
} & Partial<Record<PlayerRole, UpstreamRank | null>>;

interface UpstreamSummary {
  username: string;
  avatar: string | null;
  namecard: string | null;
  title: string | null;
  endorsement: { level: number; frame: string } | null;
  competitive: {
    pc: UpstreamPlatform | null;
    console: UpstreamPlatform | null;
  } | null;
  /** Unix 초 */
  last_updated_at: number | null;
}

// 상태별로 사용자가 할 일이 달라서 갈라 던진다.
// 404는 태그를 고치고, 504는 기다리고, 502는 기다려도 안 된다.
const request = async <T>(path: string): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    });
  } catch (error) {
    // AbortSignal.timeout()은 AbortError가 아니라 TimeoutError를 던진다
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new OverFastError(504, 'UPSTREAM_TIMEOUT');
    }
    console.error('[OverFast] 네트워크 오류:', error);
    throw new OverFastError(502, 'UPSTREAM_ERROR');
  }

  if (response.ok) return (await response.json()) as T;

  if (response.status === 404) {
    // 상류는 { error: { error, retry_after } } 로 한 겹 더 감싼다
    const body = (await response.json().catch(() => null)) as {
      error?: { retry_after?: number };
    } | null;
    console.warn(
      '[OverFast] 플레이어 없음. retry_after:',
      body?.error?.retry_after,
    );
    throw new OverFastError(404, 'PLAYER_NOT_FOUND');
  }

  if (response.status === 429 || response.status === 503) {
    // 레이트 리밋 IP를 다른 Vercel 테넌트와 공유하므로 일시 장애로 본다
    console.warn('[OverFast] 상류 혼잡:', response.status);
    throw new OverFastError(503, 'UPSTREAM_UNAVAILABLE');
  }

  if (response.status === 504) {
    throw new OverFastError(504, 'UPSTREAM_TIMEOUT');
  }

  console.error('[OverFast] 예상 밖 응답:', response.status);
  throw new OverFastError(502, 'UPSTREAM_ERROR');
};

const toRank = (
  competitive: UpstreamSummary['competitive'],
): MyPlayerSummary['rank'] => {
  const platform = competitive?.pc
    ? ('pc' as const)
    : competitive?.console
      ? ('console' as const)
      : null;

  if (!platform || !competitive) return null;
  const data = competitive[platform];
  if (!data) return null;

  // Object.entries로 돌면 season까지 역할군으로 딸려 온다
  const entries: PlayerRankEntry[] = ROLES.flatMap((role) => {
    const value = data[role];
    if (!value) return [];
    return [
      {
        role,
        division: value.division,
        tier: value.tier,
        roleIcon: value.role_icon,
        rankIcon: value.rank_icon,
        tierIcon: value.tier_icon,
      },
    ];
  });

  if (entries.length === 0) return null;

  return { platform, season: data.season ?? null, entries };
};

/** playerId는 대소문자를 구분하므로 소문자로 바꾸면 안 된다. */
export const fetchPlayerSummary = async (
  battletag: string,
): Promise<MyPlayerSummary> => {
  const playerId = battletag.trim().replace('#', '-');
  const data = await request<UpstreamSummary>(
    `/players/${encodeURIComponent(playerId)}/summary`,
  );

  // 이미지 URL은 브라우저가 직접 불러오므로 vercel.json CSP img-src에 등록돼 있다.
  //   d15f34w2p8l1cc.cloudfront.net  avatar · namecard
  //   static.playoverwatch.com       rank · tier · role 아이콘
  // 상류가 CDN을 바꾸면 API는 200인데 이미지만 CSP에 막혀 조용히 안 뜬다.
  return {
    battletag: battletag.trim(),
    profile: {
      username: data.username,
      avatar: data.avatar ?? null,
      namecard: data.namecard ?? null,
      title: data.title ?? null,
      endorsementLevel: data.endorsement?.level ?? null,
      endorsementIcon: data.endorsement?.frame ?? null,
      // 상류는 Unix 초
      lastUpdatedAt: data.last_updated_at
        ? new Date(data.last_updated_at * 1000).toISOString()
        : null,
    },
    rank: toRank(data.competitive),
  };
};
