/* src/components/Layout/Layout.tsx */

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

      {/* 알림 자리. 훅에서 toast.success(...) 를 부르면 여기에 뜹니다.
          alert()와 달리 화면을 막지 않고 스스로 사라집니다.
          theme는 사이트가 다크 전용이라 고정합니다. */}
      <Toaster
        theme="dark"
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-main)',
            color: 'var(--color-text-main)',
          },
        }}
      />
    </div>
  );
};
