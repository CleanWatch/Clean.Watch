import { createBrowserRouter } from 'react-router-dom';
import { AsyncBoundary, Layout } from '@/components';
// NotFound만 lazy가 아니다 (lazyPages.ts 참고)
import { NotFound } from '@/pages/NotFound';
import {
  Home,
  Login,
  Register,
  Report,
  Ranking,
  MyPage,
  Admin,
  Privacy,
  Terms,
} from './lazyPages';

// key를 경로로 줘서 에러가 난 뒤 다른 메뉴로 가면 경계가 새로 마운트되며 풀린다
const withBoundary = (Component: React.ComponentType, path: string) => (
  <AsyncBoundary key={path}>
    <Component />
  </AsyncBoundary>
);

// 페이지 추가: src/pages/에 만들고 → lazyPages.ts에 등록 → 아래 children에 추가

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: withBoundary(Home, '/') },
      { path: 'login', element: withBoundary(Login, 'login') },
      { path: 'register', element: withBoundary(Register, 'register') },
      { path: 'report', element: withBoundary(Report, 'report') },
      { path: 'ranking', element: withBoundary(Ranking, 'ranking') },
      { path: 'mypage', element: withBoundary(MyPage, 'mypage') },
      { path: 'admin', element: withBoundary(Admin, 'admin') },
      { path: 'privacy', element: withBoundary(Privacy, 'privacy') },
      { path: 'terms', element: withBoundary(Terms, 'terms') },

      // 반드시 맨 마지막
      { path: '*', element: <NotFound /> },
    ],
  },
]);
