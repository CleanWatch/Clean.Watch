import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { RECAPTCHA_SITE_KEY } from '@/constants';

/**
 * 전부 공개값이다. env는 은닉이 아니라 환경 분리용.
 * 폴백을 남긴 이유: VITE_ 변수가 배포에서 빠지면 undefined가 빌드에 굳어 사이트가 죽는다.
 * 빈 문자열·공백도 "값 없음"으로 본다 (빈 APP_ID로 배포돼 Firestore가 전부 막힌 적이 있다).
 */
const envOr = (value: string | undefined, fallback: string): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

const firebaseConfig = {
  apiKey: envOr(
    import.meta.env.VITE_FIREBASE_API_KEY,
    'AIzaSyCF8BQ6GWKxJRPWENeNR_vnelH3TaJJan4',
  ),
  authDomain: envOr(
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    'owanticheat.firebaseapp.com',
  ),
  projectId: envOr(import.meta.env.VITE_FIREBASE_PROJECT_ID, 'owanticheat'),
  storageBucket: envOr(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    'owanticheat.firebasestorage.app',
  ),
  messagingSenderId: envOr(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    '100898239448',
  ),
  appId: envOr(
    import.meta.env.VITE_FIREBASE_APP_ID,
    '1:100898239448:web:9fab069ba0e816616ef8ad',
  ),
};

const app = initializeApp(firebaseConfig);

// App Check: 규칙은 "누가", App Check는 "어디서" 요청했는지 본다.
// 브라우저→구글 직행인 로그인 경로도 덮는다. getFirestore/getAuth보다 먼저 초기화해야 한다.
if (import.meta.env.DEV) {
  // localhost는 reCAPTCHA를 통과 못 해 디버그 토큰을 쓴다. 없으면 SDK가 만들어 콘솔에 찍는다.
  // DEV 블록이라 프로덕션 번들엔 안 들어간다. 조건 없이 두면 누구나 App Check를 우회한다.
  (
    self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }
  ).FIREBASE_APPCHECK_DEBUG_TOKEN =
    import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
}

try {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
} catch (error) {
  // 던지면 이 모듈을 쓰는 화면이 전부 죽는다. 대신 로그는 꼭 남긴다.
  console.error('[App Check] 초기화 실패:', error);
}

export const db = getFirestore(app);
export const auth = getAuth(app);
