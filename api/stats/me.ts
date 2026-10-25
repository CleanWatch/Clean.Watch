import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireUid, toErrorResponse } from '../_lib/auth.js';
import {
  OverFastError,
  fetchPlayerSummary,
  isValidBattletag,
} from '../_lib/overfast.js';

/**
 * 본인 오버워치 프로필 요약.
 *
 * 배틀태그를 파라미터로 받으면 OverFast 스크래핑 통로가 되므로 uid로 DB에서 읽는다.
 * 태그를 받는 엔드포인트를 만들 땐 uid별 쓰로틀을 같이 넣을 것 (stats/verify.ts 참고).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const uid = await requireUid(req);

    const snap = await getAdminFirestore().collection('users').doc(uid).get();
    const battletag = snap.data()?.battletag as string | undefined | null;

    if (!battletag) {
      return res.status(400).json({ error: 'BATTLETAG_NOT_SET' });
    }

    // 폼 검증을 안 거친 과거 데이터가 있다. "미등록"과 화면이 달라야 해서 코드를 나눈다.
    if (!isValidBattletag(battletag)) {
      return res.status(422).json({ error: 'BATTLETAG_INVALID' });
    }

    const summary = await fetchPlayerSummary(battletag);

    // 캐시는 React Query 하나만. HTTP 캐시가 겹치면 invalidate가 안 먹고 로그아웃 뒤에도 남는다.
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json(summary);
  } catch (error) {
    if (error instanceof OverFastError) {
      return res.status(error.status).json({ error: error.code });
    }

    console.error('[Stats Me Error]:', error);
    const { status, body } = toErrorResponse(error);
    return res.status(status).json(body);
  }
}
