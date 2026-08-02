/* api/_lib/overfast.ts */

import type {
  MyPlayerSummary,
  PlayerRankEntry,
  PlayerRole,
  PlayerStatsErrorCode,
} from '../../src/types/stats.js';

const BASE_URL = 'https://overfast-api.tekrop.fr';

/**
 * 상류 호출 제한 시간.
 *
 * OverFast는 요청을 받으면 블리자드 커리어 페이지를 긁습니다. 캐시가 없는 계정은
 * 몇 초씩 걸릴 수 있어 넉넉히 잡되, 클라이언트(src/api/axios.ts, 10초)보다는
 * 짧아야 합니다. 서버가 먼저 포기해야 원인을 담은 상태 코드를 돌려줄 수 있고,
 * 클라이언트가 먼저 끊으면 코드 없는 ECONNABORTED만 남습니다.
 */
const UPSTREAM_TIMEOUT_MS = 8_000;

/**
 * 무료 공개 API라 신원을 밝힙니다.
 *
 * 문제가 생겼을 때 운영자가 우리에게 연락할 수단이 있어야, IP 대역째
 * 차단당하는 대신 조정할 기회가 생깁니다.
 */
const USER_AGENT =
  'CleanWatch/1.0 (+https://overwatch-anithack-otzm.vercel.app)';

/** 경쟁전 역할군. Object.entries로 순회하면 안 되는 이유는 아래 참고. */
const ROLES = ['tank', 'damage', 'support', 'open'] as const;

/**
 * src/utils/validations.ts의 isValidBattletag와 **같은 정규식의 사본**입니다.
 *
 * api/는 @/ 별칭을 쓸 수 없어 공유가 안 됩니다. 한쪽만 고치면 폼은 통과시키는데
 * 서버가 거부하는(또는 그 반대의) 상태가 되므로 반드시 함께 수정하세요.
 */
const BATTLETAG_PATTERN = /^[a-zA-Z가-힣][a-zA-Z0-9가-힣]{1,11}#[0-9]{4,5}$/;

export const isValidBattletag = (tag?: string | null): boolean =>
  !!tag && BATTLETAG_PATTERN.test(tag.trim());

/** 호출부가 상태 코드와 코드 문자열로 변환할 수 있도록 구분되는 에러. */
export class OverFastError extends Error {
  // 생성자 파라미터 프로퍼티는 tsconfig의 erasableSyntaxOnly가 막습니다.
  readonly status: number;
  readonly code: PlayerStatsErrorCode;

  constructor(status: number, code: PlayerStatsErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'OverFastError';
    this.status = status;
    this.code = code;
  }
}

// ── 상류 응답 형태 (실측 기준, 필요한 필드만) ────────────────────────────
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

/**
 * 상류 GET 한 번. 실패는 전부 OverFastError로 바꿔서 던집니다.
 *
 * 상태를 잘게 나누는 이유: 사용자가 다음에 할 행동이 다르기 때문입니다.
 * 404는 배틀태그를 고쳐야 하고, 504는 기다리면 되고, 502는 기다려도 안 됩니다.
 * 하나로 뭉치면 "잠시 후 다시 시도"라는 쓸모없는 안내만 남습니다.
 */
const request = async <T>(path: string): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    });
  } catch (error) {
    // AbortSignal.timeout()은 TimeoutError를 던집니다. AbortError가 아닙니다.
    // api/auth/discord/callback.ts가 AbortError를 보는 것은 그쪽이
    // AbortController.abort()를 쓰기 때문이며, 여기서 그대로 복사하면
    // 모든 타임아웃이 UPSTREAM_ERROR로 잘못 분류됩니다. (Node 24에서 확인)
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new OverFastError(504, 'UPSTREAM_TIMEOUT');
    }
    console.error('[OverFast] 네트워크 오류:', error);
    throw new OverFastError(502, 'UPSTREAM_ERROR');
  }

  if (response.ok) return (await response.json()) as T;

  if (response.status === 404) {
    // 상류는 { error: { error, retry_after, ... } } 로 error를 한 겹 더 감쌉니다.
    // retry_after는 상류가 이 계정을 다시 확인할 시각까지의 초입니다.
    const body = (await response.json().catch(() => null)) as {
      error?: { retry_after?: number };
    } | null;
    console.warn('[OverFast] 플레이어 없음. retry_after:', body?.error?.retry_after);
    throw new OverFastError(404, 'PLAYER_NOT_FOUND');
  }

  if (response.status === 429 || response.status === 503) {
    // 레이트 리밋은 호출자 IP 기준인데 그 IP가 Vercel 함수라 다른 테넌트와
    // 공유됩니다. 우리 트래픽이 아닌 것 때문에 막힐 수 있으므로 일시적으로 다룹니다.
    console.warn('[OverFast] 상류 혼잡:', response.status);
    throw new OverFastError(503, 'UPSTREAM_UNAVAILABLE');
  }

  if (response.status === 504) {
    throw new OverFastError(504, 'UPSTREAM_TIMEOUT');
  }

  console.error('[OverFast] 예상 밖 응답:', response.status);
  throw new OverFastError(502, 'UPSTREAM_ERROR');
};

/** 경쟁전 정보를 우리 형태로 정규화합니다. 기록이 없으면 null. */
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

  // Object.entries(data)로 순회하면 안 됩니다. season(숫자)이 역할군들과
  // 같은 객체에 나란히 들어 있어 역할군으로 딸려옵니다.
  const entries: PlayerRankEntry[] = ROLES.flatMap((role) => {
    const value = data[role];
    if (!value) return []; // 안 한 역할군은 null로 옵니다
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

  // 빈 배열을 내보내면 화면이 빈 껍데기를 그립니다. 없으면 없다고 해야 합니다.
  if (entries.length === 0) return null;

  return { platform, season: data.season ?? null, entries };
};

/**
 * 배틀태그 하나의 프로필 요약을 가져옵니다.
 *
 * playerId는 '#'을 '-'로 바꾼 형태입니다. **대소문자를 구분하므로**
 * 소문자로 정규화하면 안 됩니다 — 제대로 입력한 태그가 깨집니다.
 */
export const fetchPlayerSummary = async (
  battletag: string,
): Promise<MyPlayerSummary> => {
  const playerId = battletag.trim().replace('#', '-');
  const data = await request<UpstreamSummary>(
    `/players/${encodeURIComponent(playerId)}/summary`,
  );

  return {
    battletag: battletag.trim(),
    profile: {
      username: data.username,
      avatar: data.avatar ?? null,
      namecard: data.namecard ?? null,
      title: data.title ?? null,
      endorsementLevel: data.endorsement?.level ?? null,
      endorsementIcon: data.endorsement?.frame ?? null,
      // 상류는 Unix 초로 줍니다. 밀리초로 착각하면 1970년이 됩니다.
      lastUpdatedAt: data.last_updated_at
        ? new Date(data.last_updated_at * 1000).toISOString()
        : null,
    },
    rank: toRank(data.competitive),
  };
};
