/* src/components/Layout/Layout.tsx */

import { Outlet } from 'react-router-dom';
import { useAutoLogout } from '@/hooks';
import { Footer, Header } from '@/components';

export const Layout = () => {
  useAutoLogout();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex grow flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
