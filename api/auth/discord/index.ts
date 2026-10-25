import { randomBytes } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildStateCookie } from '../../_lib/oauth.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error('[Discord API] 환경 변수 누락');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  // CSRF 방어용 state. 콜백에서 쿠키 값과 대조한다.
  const state = randomBytes(32).toString('hex');
  res.setHeader('Set-Cookie', buildStateCookie(state));

  const url =
    `https://discord.com/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&scope=identify%20email` +
    `&state=${state}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  res.redirect(302, url);
}
