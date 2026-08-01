/* api/_lib/oauth.ts */

import { timingSafeEqual } from 'node:crypto';

/**
 * Discord OAuth의 CSRF 방어용 state를 담는 쿠키 이름.
 * 인가 시작(api/auth/discord/index.ts)과 콜백(callback.ts)이 함께 씁니다.
 */
export const OAUTH_STATE_COOKIE = 'discord_oauth_state';

/**
 * state 쿠키의 공통 속성.
 *
 * - HttpOnly: 스크립트가 읽지 못하게 합니다
 * - SameSite=Lax: Discord에서 되돌아오는 최상위 이동에는 쿠키가 실립니다.
 *   Strict로 두면 외부 사이트에서 돌아올 때 쿠키가 빠져 로그인이 아예 막힙니다
 * - Secure: HTTPS에서만 전송
 */
const COOKIE_FLAGS = 'HttpOnly; Secure; SameSite=Lax; Path=/';

/** 인가 시작 시 state를 심습니다. 인가 절차는 몇 분이면 끝나므로 10분이면 충분합니다. */
export const buildStateCookie = (state: string): string =>
  `${OAUTH_STATE_COOKIE}=${state}; ${COOKIE_FLAGS}; Max-Age=600`;

/** 사용한 state가 재사용되지 않도록 즉시 만료시킵니다. */
export const buildClearedStateCookie = (): string =>
  `${OAUTH_STATE_COOKIE}=; ${COOKIE_FLAGS}; Max-Age=0`;

/**
 * 상수 시간 문자열 비교.
 *
 * 단순 === 비교는 앞에서부터 다른 지점이 나오면 즉시 반환하므로, 응답 시간
 * 차이로 값을 한 글자씩 추측당할 여지가 있습니다. timingSafeEqual은 길이가
 * 다르면 예외를 던지므로 길이를 먼저 걸러냅니다.
 */
export const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};
