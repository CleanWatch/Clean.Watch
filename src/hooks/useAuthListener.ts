import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { auth } from '@/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuthListener = () => {
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAuth(firebaseUser.uid);
      } else {
        // Firebase 세션이 없으면 localStorage의 디스코드 세션을 본다
        const discordUserStr = localStorage.getItem('user');
        if (discordUserStr) {
          try {
            const parsedUser = JSON.parse(discordUserStr);
            setAuth(parsedUser.id || parsedUser.uid);
          } catch (e) {
            console.error('Discord 세션 파싱 실패:', e);
            setAuth(null);
          }
        } else {
          setAuth(null);
        }
      }
    });

    return () => unsubscribe();
  }, [setAuth]);
};
