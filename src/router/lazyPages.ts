/* src/router/lazyPages.ts */

import { lazy } from 'react';

// 헬퍼 함수: Named Export 컴포넌트를 동적 임포트할 때 반복되는 패턴 축약
const lazyImport = (
  importFunc: () => Promise<Record<string, React.ComponentType>>,
  name: string,
) => lazy(() => importFunc().then((m) => ({ default: m[name] })));

/*
 <Lazy 로딩 설정>
 [!]: pages/index.ts (바렐 파일)를 거치지 않고 개별 파일 경로로 다이렉트 임포트
 [*]: Vite(Rollup)의 청크 분할(Code Splitting) 최적화를 온전히 유지하기 위함

 <예외 — NotFound는 여기에 없습니다>
 router/index.tsx에서 직접 임포트합니다. 뭔가 잘못돼서 뜨는 화면이 또 잘못될 수
 있는 구조를 만들지 않으려는 것입니다. 청크 요청이 실패하면(네트워크 불안정,
 배포 직후 옛 해시) 404 화면 대신 진짜 빈 화면이 남습니다.

 나눠서 얻는 것도 없습니다. NotFound가 쓰는 ErrorState는 에러 경계를 통해
 이미 메인 번들에 들어 있어서, 떼어내 봐야 메인이 45바이트 줄고 요청만 하나
 늘어납니다(실측).
 */

// Lazy 로딩: 바렐 파일(@/pages)을 거치지 않고 다이렉트로 꽂아서 청크 분할 최적화
export const Home = lazyImport(() => import('@/pages/Home'), 'Home');
export const Login = lazyImport(() => import('@/pages/Login'), 'Login');
export const Register = lazyImport(
  () => import('@/pages/Register'),
  'Register',
);
export const Report = lazyImport(() => import('@/pages/Report'), 'Report');
export const Ranking = lazyImport(() => import('@/pages/Ranking'), 'Ranking');
export const MyPage = lazyImport(() => import('@/pages/MyPage'), 'MyPage');
export const Admin = lazyImport(() => import('@/pages/Admin'), 'Admin');
export const Privacy = lazyImport(
  () => import('@/pages/Legal/Privacy'),
  'Privacy',
);
export const Terms = lazyImport(() => import('@/pages/Legal/Terms'), 'Terms');
