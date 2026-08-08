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
 * 로컬 개발에서만 Cloudflare 테스트 키를 씁니다. 위젯의 허용 호스트 목록에
 * localhost가 없어 실제 키로는 도메인 미등록 오류(110200)로 위젯이 죽습니다.
 * 호스트 목록은 Cloudflare 대시보드에서만 바꿀 수 있어 코드로는 해결이 안 됩니다.
 *
 * env가 아니라 import.meta.env.DEV로 가르는 이유:
 * 위와 같은 이유로 VITE_ 변수는 배포 환경에서 누락될 수 있는데,
 * DEV는 Vite가 빌드 시점에 false로 치환하므로 그 위험이 없습니다.
 * 죽은 가지는 제거되어 프로덕션 번들에 테스트 키 문자열이 남지 않습니다.
 *
 * 짝이 되는 TURNSTILE_SECRET_KEY도 로컬 .env에서 테스트 시크릿으로 맞춰야
 * 합니다. 한쪽만 테스트 키면 검증이 전부 실패합니다.
 */
// 관문 동작(버튼 잠김 등)을 눈으로 확인하려면 '3x00000000000000000000FF'로
// 잠시 바꾸세요. 상호작용을 강제하는 키라 위젯이 저절로 통과하지 않습니다.
// 평소에는 아래 자동 통과 키가 편합니다.
export const TURNSTILE_SITE_KEY = import.meta.env.DEV
  ? '1x00000000000000000000AA' // 항상 통과하는 테스트 위젯
  : '0x4AAAAAADwlrxyiGsogdlgW';

/**
 * Firebase App Check용 reCAPTCHA v3 사이트 키.
 *
 * Turnstile 사이트 키와 마찬가지로 브라우저에 노출되는 공개값입니다.
 * 짝이 되는 비밀 키는 우리가 갖고 있지 않습니다 — Firebase 콘솔에 등록해 두면
 * 구글이 자기 서버끼리 대조하므로, 이 프로젝트 코드에는 비밀이 없습니다.
 *
 * 이 키가 막는 것은 Firestore 규칙이나 Turnstile과 다릅니다.
 * 규칙은 "누가" 요청했는지, App Check는 "어디서" 요청했는지를 봅니다.
 * 로그인은 브라우저에서 구글로 직접 가서 우리 서버를 거치지 않으므로
 * Turnstile로는 막을 수 없는데, App Check는 그 경로에 붙습니다.
 *
 * 개발 환경 분기가 없는 이유: localhost는 디버그 토큰으로 통과합니다.
 * src/firebase/firebase.ts 참고.
 */
export const RECAPTCHA_SITE_KEY = '6Lc-wHEtAAAAAGidLUY3csG5h0f0a3XM3fUEn_Fg';

/**
 * 약관·개인정보처리방침에 들어가는 값.
 *
 * 두 문서와 가입 동의 문구가 같은 값을 봐야 하므로 여기 모읍니다.
 * 흩어 놓으면 시행일 하나 고칠 때 한쪽만 낡습니다.
 */
export const LEGAL_EFFECTIVE_DATE = '2026-08-08';

/**
 * 개인정보 보호책임자 연락처.
 *
 * ⚠️ **아직 수신되지 않는 주소입니다.** 「개인정보 보호법」상 방침의 필수
 * 기재사항이라 문서에는 넣어 두었지만, 실제로 메일을 받을 수 있게 하기 전에는
 * 신고 대상자의 이의 제기가 도착하지 않습니다. Zoho Mail 무료로 개설 가능하며
 * 자세한 조건은 BACKLOG.md 「푸터 연락처」에 있습니다.
 */
export const CONTACT_EMAIL = 'admin@cleanwatch.cloud';

/** 신고 삭제·정정 요청 처리 기한(일). 문서에 약속하는 값입니다. */
export const REMOVAL_REQUEST_DAYS = 7;
