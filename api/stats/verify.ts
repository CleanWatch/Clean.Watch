import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireUid, toErrorResponse } from '../_lib/auth.js';
import { ThrottleError, consumeQuota } from '../_lib/throttle.js';
import {
  OverFastError,
  fetchPlayerSummary,
  isValidBattletag,
} from '../_lib/overfast.js';

const LIMIT = 10;
const WINDOW_MS = 10 * 60 * 1000;

/**
 * 배틀태그 실존 확인.
 *
 * "없음"은 404가 아니라 200 { exists: false }. 그래야 클라이언트가 "확실히 없다"와
 * "못 물어봤다"를 구분한다. 비공개 프로필도 404라서 결과로 저장을 막으면 안 된다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const uid = await requireUid(req);

    const { battletag } = req.body ?? {};

    if (!battletag || typeof battletag !== 'string') {
      return res.status(400).json({ error: 'Bad Request: Missing battletag' });
    }

    const tag = battletag.trim();

    // 형식 오류로 할당량이 깎이지 않게 쓰로틀보다 먼저 본다
    if (!isValidBattletag(tag)) {
      return res.status(422).json({ error: 'BATTLETAG_INVALID' });
    }

    await consumeQuota(uid, 'stats-verify', LIMIT, WINDOW_MS);

    await fetchPlayerSummary(tag);
    return res.status(200).json({ exists: true });
  } catch (error) {
    if (error instanceof ThrottleError) {
      return res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        retryAfterSeconds: error.retryAfterSeconds,
      });
    }

    if (error instanceof OverFastError && error.code === 'PLAYER_NOT_FOUND') {
      return res.status(200).json({ exists: false });
    }

    if (error instanceof OverFastError) {
      return res.status(error.status).json({ error: error.code });
    }

    console.error('[Stats Verify Error]:', error);
    const { status, body } = toErrorResponse(error);
    return res.status(status).json(body);
  }
}
