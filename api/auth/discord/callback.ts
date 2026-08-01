import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import {
  OAUTH_STATE_COOKIE,
  buildClearedStateCookie,
  safeEqual,
} from '../../_lib/oauth.js';
// 격리된 파이어베이스 어드민 호출
import { getAdminAuth, getAdminFirestore } from '../../_lib/firebaseAdmin.js';

// 디스코드 응답 데이터 타입 단언 (Strict Mode 방어)
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
  // Method Guard
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code, state } = req.query;

  // Payload Guard
  if (!code || typeof code !== 'string') {
    return res
      .status(400)
      .json({ error: 'Bad Request: Missing authorization code' });
  }

  // CSRF Guard: 인가를 시작한 브라우저가 맞는지 확인합니다.
  // 이 검사가 없으면 공격자가 자신의 인가 코드를 피해자에게 열게 만들어
  // 피해자를 공격자 계정으로 로그인시킬 수 있습니다.
  const cookieState = req.cookies?.[OAUTH_STATE_COOKIE];

  // 사용한 state는 재사용되지 않도록 즉시 만료시킵니다.
  res.setHeader('Set-Cookie', buildClearedStateCookie());

  if (
    typeof state !== 'string' ||
    typeof cookieState !== 'string' ||
    !safeEqual(state, cookieState)
  ) {
    console.error('[Discord] state 불일치 — CSRF 의심 또는 쿠키 만료');
    return res.status(403).json({ error: 'Forbidden: Invalid state' });
  }

  // 리소스 고갈 방어 (10s timeout)
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

    // Step A: 디스코드 토큰 발급
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

    // Step B: 디스코드 유저 정보 조회
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      signal: controller.signal,
    });

    clearTimeout(timeoutId); // 외부 통신 완료 시 타임아웃 해제

    const user = (await userResponse.json()) as DiscordUser;

    // Step C: 격리된 파이어베이스 도구 로드 및 커스텀 토큰 굽기
    const adminAuth = getAdminAuth();
    const db = getAdminFirestore();

    const firebaseToken = await adminAuth.createCustomToken(user.id);

    // Step D: Firestore DB 갱신
    const userRef = db.collection('users').doc(user.id);
    const prev = (await userRef.get()).data();

    // Discord의 avatar는 URL이 아니라 해시라서 CDN 경로로 조립해야 함
    const photoUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff`;

    // 매 로그인마다 갱신되는 필드
    const patch: Record<string, unknown> = {
      uid: user.id,
      username: user.username,
      email: user.email || '',
      avatar: user.avatar || '', // 원본 해시 유지 (다른 크기/포맷 URL 재생성용)
      photoUrl,
      lastLogin: FieldValue.serverTimestamp(),
    };

    // 최초 1회만 기록. 매번 쓰면 관리자가 강등되고 가입일이 갱신됨
    if (!prev?.role) patch.role = 'user';
    if (!prev?.createdAt) patch.createdAt = FieldValue.serverTimestamp();
    if (prev?.battletag === undefined) patch.battletag = null;

    await userRef.set(patch, { merge: true });

    // Step E: 프론트엔드로 상대 경로 리다이렉트 (레거시의 하드코딩 URL 대체)
    // 해시(#)로 넘기면 서버 액세스 로그에 토큰이 남지 않습니다.
    // 쿼리스트링(?)은 요청 URL의 일부라 그대로 기록됩니다.
    res.redirect(302, `/login#token=${firebaseToken}`);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[Discord Callback Error]:', error);
    const status =
      error instanceof Error && error.name === 'AbortError' ? 504 : 500;
    res.status(status).json({ error: 'Internal Server Error or Timeout' });
  }
}
