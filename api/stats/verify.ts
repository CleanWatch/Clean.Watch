/* api/stats/verify.ts */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireUid, toErrorResponse } from '../_lib/auth.js';
import { ThrottleError, consumeQuota } from '../_lib/throttle.js';
import {
  OverFastError,
  fetchPlayerSummary,
  isValidBattletag,
} from '../_lib/overfast.js';

/** 10분에 10번. 오타를 고쳐가며 몇 번 눌러도 정상 사용자는 걸리지 않습니다. */
const LIMIT = 10;
const WINDOW_MS = 10 * 60 * 1000;

/**
 * 입력한 배틀태그가 오버워치에 실제로 있는지 확인합니다.
 *
 * **"없음"은 에러가 아니라 결과(200)입니다.** 404로 던지면 클라이언트가 "확실히 없다"와
 * "못 물어봤다"를 구분할 수 없습니다. 이렇게 갈라야 호출부의 `catch`가 그대로
 * **"확인 실패 → 그냥 통과"** 분기가 됩니다. 상류가 죽었다고 가입을 막으면 안 됩니다.
 *
 * ⚠️ 비공개 프로필도 404를 냅니다. 그래서 이 엔드포인트의 결과로 **저장을 막으면
 * 안 됩니다.** 비공개는 흔한 설정이라, 거부하면 그 사람들은 자기 진짜 배틀태그를
 * 아예 등록할 수 없습니다. 화면은 경고만 하고 다시 누르면 저장되게 해야 합니다.
 *
 * `me.ts`와 달리 배틀태그를 **본문으로 받으므로** 스크래핑 증폭기가 될 수 있습니다.
 * 그래서 `me.ts` 주석이 요구한 대로 uid별 쓰로틀을 같은 커밋에서 넣었습니다.
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

    // 형식 검사를 쓰로틀보다 먼저 둡니다. 상류로 나가지 않는 요청이라 증폭기와
    // 무관하고, 오타 때문에 정상 사용자의 할당량이 깎이지 않습니다.
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

    // 여기만 결과로 바꿉니다. 나머지 OverFastError(502·503·504)는 그대로 에러입니다.
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
