/* src/constants/index.ts */

/**
 * Cloudflare Turnstile 사이트 키.
 *
 * 위젯이 DOM에 렌더링할 때 그대로 노출되는 공개값이라 비밀이 아닙니다.
 * 실제 검증은 서버(api/verify-captcha.ts)가 TURNSTILE_SECRET_KEY로 수행하며,
 * 비밀로 관리해야 하는 것은 그 키뿐입니다.
 *
 * env가 아니라 상수인 이유:
 * VITE_ 변수는 빌드 시점에 번들로 인라인되므로 은닉 효과가 없고,
 * 배포 환경에 값이 누락되면 undefined가 그대로 굳어 위젯이 죽습니다.
 * 실제로 회원가입 페이지가 이 상태(sitekey: void 0)로 배포되어
 * 이메일 회원가입이 차단되어 있었습니다.
 *
 * 환경별로 다른 키(테스트 키 등)가 필요해지면 그때 env로 옮깁니다.
 * 사용처가 이 한 곳으로 모여 있어 교체가 쉽습니다.
 */
export const TURNSTILE_SITE_KEY = '0x4AAAAAADwlrxyiGsogdlgW';
