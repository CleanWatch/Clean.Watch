/* src/pages/Login/hooks/useDiscordCallback.ts */

import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  signInWithCustomToken,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '@/firebase/firebase';

// 콜백은 토큰을 해시(#token=)로 넘깁니다. 해시는 서버로 전송되지 않아
// Vercel 액세스 로그나 Referer 헤더에 토큰이 남지 않습니다.
const readTokenFromHash = () =>
  new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token');

export const useDiscordCallback = () => {
  const navigate = useNavigate();
  const handled = useRef(false);
  const [isExchanging, setIsExchanging] = useState(
    () => readTokenFromHash() !== null,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (handled.current) return;

    const token = readTokenFromHash();
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
