import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import {
  OAUTH_STATE_COOKIE,
  buildClearedStateCookie,
  safeEqual,
} from '../../_lib/oauth.js';
import { getAdminAuth, getAdminFirestore } from '../../_lib/firebaseAdmin.js';

interface DiscordTokenResponse {
  access_token?: string;
  error?: string;
}

interface DiscordUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code, state } = req.query;

  if (!code || typeof code !== 'string') {
    return res
      .status(400)
      .json({ error: 'Bad Request: Missing authorization code' });
  }

  // 공격자가 자기 인가 코드로 피해자를 공격자 계정에 로그인시키는 것을 막는다
  const cookieState = req.cookies?.[OAUTH_STATE_COOKIE];

  res.setHeader('Set-Cookie', buildClearedStateCookie());

  if (
    typeof state !== 'string' ||
    typeof cookieState !== 'string' ||
    !safeEqual(state, cookieState)
  ) {
    console.error('[Discord] state 불일치 — CSRF 의심 또는 쿠키 만료');
    return res.status(403).json({ error: 'Forbidden: Invalid state' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID || '',
      client_secret: process.env.DISCORD_CLIENT_SECRET || '',
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI || '',
    });

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: controller.signal,
    });

    const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;

    if (!tokenData.access_token) {
      console.error('[Discord] 토큰 발급 거절:', tokenData);
      return res
        .status(401)
        .json({ error: 'Unauthorized: Token negotiation failed' });
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const user = (await userResponse.json()) as DiscordUser;

    const adminAuth = getAdminAuth();
    const db = getAdminFirestore();

    const firebaseToken = await adminAuth.createCustomToken(user.id);

    const userRef = db.collection('users').doc(user.id);
    const prev = (await userRef.get()).data();

    // avatar는 해시라 CDN 경로로 조립한다. 없으면 Avatar 컴포넌트가 이니셜을 그린다.
    const photoUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : null;

    const patch: Record<string, unknown> = {
      uid: user.id,
      username: user.username,
      email: user.email || '',
      avatar: user.avatar || '',
      photoUrl,
      lastLogin: FieldValue.serverTimestamp(),
    };

    // 최초 1회만. 매번 쓰면 관리자가 강등되고 가입일이 바뀐다.
    if (!prev?.role) patch.role = 'user';
    if (!prev?.createdAt) patch.createdAt = FieldValue.serverTimestamp();
    if (prev?.battletag === undefined) patch.battletag = null;

    await userRef.set(patch, { merge: true });

    // 쿼리스트링과 달리 해시는 서버 액세스 로그에 남지 않는다
    res.redirect(302, `/login#token=${firebaseToken}`);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[Discord Callback Error]:', error);
    const status =
      error instanceof Error && error.name === 'AbortError' ? 504 : 500;
    res.status(status).json({ error: 'Internal Server Error or Timeout' });
  }
}
