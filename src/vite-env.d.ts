/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 공개값. 없으면 src/firebase/firebase.ts의 하드코딩 값으로 폴백
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;

  // 로컬 전용 App Check 디버그 토큰 (팀 공유용)
  readonly VITE_APPCHECK_DEBUG_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
