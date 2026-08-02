// TS에 .env의 존재를 알리고 주입

// TS 특수 명령어: vite 기본 규칙 적용
/// <reference types="vite/client" />

// 커스텀 환경변수 명세서 (API 키 추가 시 작성)
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;

  // App Check 로컬 개발용 디버그 토큰. 팀이 하나를 공유하기 위한 것으로,
  // 없으면 브라우저마다 토큰이 생성됩니다. src/firebase/firebase.ts 참고.
  // 프로덕션에는 쓰이지 않습니다(DEV 블록 안에서만 읽습니다).
  readonly VITE_APPCHECK_DEBUG_TOKEN?: string;
}

// TS 시스템에 명세서 강제 병합
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
