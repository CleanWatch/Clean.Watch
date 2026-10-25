import { timingSafeEqual } from 'node:crypto';

/** Discord OAuth CSRF 방어용 state 쿠키 */
export const OAUTH_STATE_COOKIE = 'discord_oauth_state';

// SameSite=Strict면 Discord에서 돌아오는 이동에 쿠키가 빠져 로그인이 막힌다
const COOKIE_FLAGS = 'HttpOnly; Secure; SameSite=Lax; Path=/';

export const buildStateCookie = (state: string): string =>
  `${OAUTH_STATE_COOKIE}=${state}; ${COOKIE_FLAGS}; Max-Age=600`;

export const buildClearedStateCookie = (): string =>
  `${OAUTH_STATE_COOKIE}=; ${COOKIE_FLAGS}; Max-Age=0`;

/** 타이밍 공격 방지용 비교. timingSafeEqual은 길이가 다르면 던지므로 먼저 거른다. */
export const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};
