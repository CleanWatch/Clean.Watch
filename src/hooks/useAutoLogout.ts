import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';
import { useLogoutMutation } from '@/hooks';

export const useAutoLogout = () => {
  const { isLoggedIn } = useAuthStore();
  const { mutate: logout } = useLogoutMutation();

  useEffect(() => {
    if (!isLoggedIn) return;

    let inactivityTimer: number;

    const performLogout = () => {
      toast.info('장시간 움직임이 없어 자동 로그아웃 되었습니다');
      logout();
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(performLogout, 30 * 60 * 1000);
    };

    const events = [
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart',
      'scroll',
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      window.clearTimeout(inactivityTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isLoggedIn, logout]);
};
