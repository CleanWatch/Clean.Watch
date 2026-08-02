/* src/components/Layout/Layout.tsx */

import { Outlet } from 'react-router-dom';
import { useAutoLogout } from '@/hooks';
import { Footer } from '@/components';

export const Layout = () => {
  useAutoLogout();
  return (
    <div className="flex min-h-screen flex-col">
      {/* TODO: 여기에 <Header /> 컴포넌트가 들어갑니다 */}

      <main className="flex grow flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
