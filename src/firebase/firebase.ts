/* src/firebase/firebase.ts */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { RECAPTCHA_SITE_KEY } from '@/constants';

const firebaseConfig = {
  apiKey: 'AIzaSyCF8BQ6GWKxJRPWENeNR_vnelH3TaJJan4',
  authDomain: 'owanticheat.firebaseapp.com',
  projectId: 'owanticheat',
  storageBucket: 'owanticheat.firebasestorage.app',
  messagingSenderId: '100898239448',
  appId: '1:100898239448:web:9fab069ba0e816616ef8ad',
};

const app = initializeApp(firebaseConfig);

/**
 * App Check — 이 요청이 우리 앱에서 왔는지 구글이 판별하게 합니다.
 *
 * Firestore 규칙은 "누가" 요청했는지(로그인 여부, 본인 문서인지)를 보지만
 * "어디서" 왔는지는 모릅니다. 그래서 스크립트로 계정을 여럿 만들어 정상 경로로
 * 신고를 반복하거나, 로그인 비밀번호를 무차별로 넣어보는 것은 규칙으로 막히지
 * 않습니다. 규칙 입장에서는 전부 합법적인 요청이기 때문입니다.
 *
 * Turnstile로도 막을 수 없습니다. signInWithEmailAndPassword는 브라우저에서
 * 구글 서버로 직접 가므로 우리 서버가 그 경로에 없습니다. App Check는 구글
 * 쪽에 붙는 검사라 그 경로를 덮습니다.
 *
 * getFirestore/getAuth보다 먼저 호출해야 이후 요청에 토큰이 실립니다.
 */
if (import.meta.env.DEV) {
  // localhost는 reCAPTCHA 검증을 통과할 수 없습니다. true로 두면 SDK가
  // 디버그 토큰을 만들어 콘솔에 출력하고, 그 값을 Firebase 콘솔의
  // App Check > 앱 > 디버그 토큰 관리에 등록하면 로컬에서도 통과합니다.
  //
  // 반드시 initializeAppCheck보다 먼저 설정해야 합니다.
  // import.meta.env.DEV는 빌드 시점에 false로 치환되므로 이 블록은
  // 프로덕션 번들에 포함되지 않습니다. 조건 없이 두면 누구나 디버그
  // 토큰으로 App Check를 우회할 수 있게 됩니다.
  (
    self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }
  ).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

try {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
} catch (error) {
  // 초기화 실패를 그대로 던지면 이 모듈을 import하는 화면 전체가 죽습니다.
  // 적용(Enforce) 전에는 App Check 없이도 앱이 돌아가야 하므로 여기서 멈춥니다.
  //
  // 적용을 켠 뒤에 이 오류가 보인다면 모든 요청이 거부되고 있다는 뜻입니다.
  // 조용히 삼키지 않고 남기는 이유가 그것입니다 — 그때 permission-denied만
  // 보이면 원인을 규칙에서 찾게 됩니다.
  console.error('[App Check] 초기화 실패:', error);
}

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
