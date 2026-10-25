import { lazy } from 'react';

// named export 컴포넌트용 lazy
const lazyImport = (
  importFunc: () => Promise<Record<string, React.ComponentType>>,
  name: string,
) => lazy(() => importFunc().then((m) => ({ default: m[name] })));

// 청크 분할이 유지되도록 배럴(@/pages)이 아니라 개별 경로로 import 한다.
// NotFound는 일부러 뺐다. 청크 로드가 실패하면 404 대신 빈 화면이 뜨기 때문이다.

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
