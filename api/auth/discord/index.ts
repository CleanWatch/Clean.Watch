/* api/auth/discord/index.ts */

import { randomBytes } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildStateCookie } from '../../_lib/oauth.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Method Guard: 브라우저 이동(GET)만 허용하여 무의미한 POST 공격 차단
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error('[Discord API] 환경 변수 누락');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  // CSRF 방어: 예측 불가능한 값을 만들어 인가 URL과 쿠키 양쪽에 담습니다.
  // 콜백에서 둘이 일치하는지 확인하면, 공격자가 자기 인가 코드를 피해자
  // 브라우저에 밀어 넣어 공격자 계정으로 로그인시키는 것을 막을 수 있습니다.
  const state = randomBytes(32).toString('hex');
  res.setHeader('Set-Cookie', buildStateCookie(state));

  const url =
    `https://discord.com/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&scope=identify%20email` +
    `&state=${state}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  // Vercel 권장 리다이렉트 (302 Found)
  res.redirect(302, url);
}
