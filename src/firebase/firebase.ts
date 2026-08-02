/* src/firebase/firebase.ts */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { RECAPTCHA_SITE_KEY } from '@/constants';

/**
 * Firebase 웹 설정.
 *
 * 전부 브라우저에 노출되는 공개값입니다. env로 옮기는 목적은 은닉이 아니라
 * **환경 분리**입니다 — 나중에 개발용 Firebase 프로젝트를 따로 두려면 필요합니다.
 *
 * ?? 뒤의 하드코딩 값을 남겨둔 이유:
 * VITE_ 변수는 빌드 시점에 값이 치환되므로, 배포 환경에 변수가 없으면
 * undefined가 그대로 굳어 initializeApp이 죽고 사이트 전체가 멈춥니다.
 * 실제로 회원가입 캡챠가 정확히 이 방식으로 죽어 있었습니다(sitekey: void 0).
 * 폴백이 있으면 변수가 빠져도 지금 값으로 돌아가므로 그 사고가 나지 않습니다.
 *
 * 폴백을 지우려면 먼저 변수가 실제로 빌드에 들어가는지 확인해야 합니다.
 * 값이 같아서 번들만 봐서는 구분되지 않으니, 폴백 없는 버전을 프리뷰 배포에
 * 올려 동작하는지 보는 것이 확인 방법입니다(변수는 Preview 스코프에도 있습니다).
 */
/**
 * 빈 문자열도 "값 없음"으로 취급합니다.
 *
 * ??는 undefined와 null만 걸러냅니다. Vercel에 변수를 만들어 두고 값을 비우거나
 * 붙여넣기가 잘못되면 빈 문자열이 그대로 들어오는데, ??는 그것을 통과시킵니다.
 * 실제로 VITE_FIREBASE_APP_ID가 빈 값으로 배포되어 App Check가 appId 없이
 * 토큰을 요청했고, Firestore 읽기가 전부 permission-denied로 막혔습니다.
 * 폴백이 있는데도 사이트가 죽은 이유가 이것이었습니다.
 *
 * 앞뒤 공백도 함께 제거합니다. 대시보드에 값을 붙여넣을 때 섞이기 쉬운데,
 * appId처럼 정확히 일치해야 하는 값은 공백 하나로 무효가 됩니다.
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
  // localhost는 reCAPTCHA 검증을 통과할 수 없어 디버그 토큰이 필요합니다.
  //
  // .env에 VITE_APPCHECK_DEBUG_TOKEN이 있으면 그 값을 씁니다. 팀이 하나를
  // 공유하면 콘솔에 한 번만 등록하면 되고, 새로 합류한 사람도 .env만 받으면
  // 됩니다(어차피 다른 비밀 값들 때문에 .env는 받아야 합니다).
  //
  // 없으면 true로 두어 SDK가 브라우저마다 토큰을 만들고 콘솔에 출력합니다.
  // 그 경우 사람마다, 브라우저마다 따로 등록해야 하고 브라우저 데이터를
  // 지우면 토큰이 새로 생겨 다시 등록해야 합니다.
  //
  // 반드시 initializeAppCheck보다 먼저 설정해야 합니다.
  // import.meta.env.DEV는 빌드 시점에 false로 치환되므로 이 블록은
  // 프로덕션 번들에 포함되지 않습니다. 조건 없이 두면 누구나 디버그
  // 토큰으로 App Check를 우회할 수 있게 됩니다.
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
