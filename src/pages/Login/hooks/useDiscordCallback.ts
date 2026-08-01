/* src/pages/Login/hooks/useDiscordCallback.ts */

import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  signInWithCustomToken,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '@/firebase/firebase';

export const useDiscordCallback = () => {
  const navigate = useNavigate();
  const handled = useRef(false);
  const [isExchanging, setIsExchanging] = useState(() =>
    new URLSearchParams(window.location.search).has('token'),
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (handled.current) return;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) return;

    handled.current = true;
    window.history.replaceState({}, '', '/login');

    (async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithCustomToken(auth, token);
        navigate('/', { replace: true });
      } catch {
        setError('로그인 세션 수립에 실패했습니다. 다시 시도해 주세요.');
        setIsExchanging(false);
      }
    })();
  }, [navigate]);

  return { isExchanging, error };
};
