import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
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

      {/* 사이트가 다크 전용이라 theme 고정 */}
      <Toaster theme="dark" position="top-center" richColors closeButton />
    </div>
  );
};
