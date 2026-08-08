import { createBrowserRouter } from 'react-router-dom';
import { AsyncBoundary, Layout } from '@/components';
// 404만 lazyPages를 거치지 않습니다. 이유는 lazyPages.ts의 <예외> 주석 참고.
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

// 헬퍼 함수: 라우터 진입 시 반복되는 로딩·에러 처리 보일러플레이트 제거
//
// 예전에는 Suspense만 걸어서 로딩은 처리되는데 에러는 아무도 안 잡았습니다.
// AsyncBoundary가 그 둘을 같이 감싸므로, 렌더 중 에러가 나면 하얀 화면 대신
// ErrorFallback이 그 자리에 뜹니다.
//
// key를 주소로 주는 이유는, 에러가 난 채로 다른 메뉴를 눌렀을 때 경계가
// 새로 마운트되어 스스로 풀리게 하기 위해서입니다. 없으면 한 번 터진 뒤
// 페이지를 옮겨도 에러 화면이 계속 남습니다.
const withBoundary = (Component: React.ComponentType, path: string) => (
  <AsyncBoundary key={path}>
    <Component />
  </AsyncBoundary>
);

/*
 <새로운 페이지 추가 가이드>
 1. src/pages/[PageName] 디렉토리 및 컴포넌트 생성
 2. src/router/lazyPages.ts에 lazyImport를 활용해 컴포넌트 내보내기 (청크 분할 목적)
 3. 아래 router 배열의 children에 { path, element: withBoundary(컴포넌트, path) } 추가
 */

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // 모든 페이지는 반드시 이 Layout(헤더/푸터)을 통과함
    children: [
      // 기존의 평면적인 라우트 구조가 중첩 라우팅(Nested Routing)으로 개선됨
      { index: true, element: withBoundary(Home, '/') },
      { path: 'login', element: withBoundary(Login, 'login') },
      { path: 'register', element: withBoundary(Register, 'register') },
      { path: 'report', element: withBoundary(Report, 'report') },
      { path: 'ranking', element: withBoundary(Ranking, 'ranking') },
      { path: 'mypage', element: withBoundary(MyPage, 'mypage') },
      { path: 'admin', element: withBoundary(Admin, 'admin') },
      { path: 'privacy', element: withBoundary(Privacy, 'privacy') },
      { path: 'terms', element: withBoundary(Terms, 'terms') },
      // {path: 'path', element: withBoundary(component, 'path') }.

      // 위 어느 것과도 맞지 않는 주소. 반드시 맨 마지막에 둡니다.
      { path: '*', element: <NotFound /> },
    ],
  },
]);
