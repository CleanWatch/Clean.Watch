// Turnstile 사이트 키는 공개값이다. env로 두면 배포에서 빠졌을 때 위젯이 죽는다.
// 로컬은 허용 호스트에 localhost가 없어 테스트 키를 쓴다 (서버 쪽 시크릿도 테스트 값으로 맞출 것).
// 캡챠 관문을 직접 확인하려면 '3x00000000000000000000FF'(상호작용 강제)로 잠시 바꾼다.
export const TURNSTILE_SITE_KEY = import.meta.env.DEV
  ? '1x00000000000000000000AA' // 항상 통과
  : '0x4AAAAAADwlrxyiGsogdlgW';

// App Check용 reCAPTCHA v3 공개 키. 로컬은 디버그 토큰으로 통과한다.
export const RECAPTCHA_SITE_KEY = '6Lc-wHEtAAAAAGidLUY3csG5h0f0a3XM3fUEn_Fg';

export const LEGAL_EFFECTIVE_DATE = '2026-08-08';

// TODO: 아직 수신이 안 되는 주소. 메일함을 열기 전엔 이의 제기가 도착하지 않는다.
export const CONTACT_EMAIL = 'admin@cleanwatch.cloud';

/** 신고 삭제·정정 요청 처리 기한(일) */
export const REMOVAL_REQUEST_DAYS = 7;
