/* api/stats/me.ts */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireUid, toErrorResponse } from '../_lib/auth.js';
import {
  OverFastError,
  fetchPlayerSummary,
  isValidBattletag,
} from '../_lib/overfast.js';

/**
 * 로그인한 사용자 **본인의** 오버워치 프로필 요약.
 *
 * 배틀태그를 파라미터로 받지 않고 ID 토큰의 uid로 Firestore에서 읽습니다.
 * 파라미터를 열면 이 엔드포인트가 OverFast 스크래핑 증폭기가 됩니다.
 * 레이트 리밋은 호출자 IP 기준인데 그 IP가 우리 Vercel 함수라, 남이 우리를 통해
 * 긁으면 전체 사용자가 함께 막힙니다. 배틀태그가 접근 로그에 남지 않는 것도
 * 부수 효과입니다(api/auth/discord/callback.ts가 토큰을 프래그먼트로 옮긴 것과 같은 이유).
 *
 * 나중에 공개 상세 페이지가 필요해지면 별도 엔드포인트로 만들되, 그때도
 * requireUid를 유지하고 uid별 쓰로틀을 같은 커밋에서 넣어야 합니다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // AuthError가 toErrorResponse로 흘러가도록 try 안에서 호출합니다.
    const uid = await requireUid(req);

    const snap = await getAdminFirestore().collection('users').doc(uid).get();
    const battletag = snap.data()?.battletag as string | undefined | null;

    // 디스코드 가입은 battletag: null을 쓰므로 falsy 검사면 충분합니다.
    if (!battletag) {
      return res.status(400).json({ error: 'BATTLETAG_NOT_SET' });
    }

    // 폼 검증을 거치지 않고 들어온 값(콘솔 직접 수정, 과거 데이터)이 있을 수 있습니다.
    // "등록되지 않음"과 구분해야 합니다 — 원인이 다르고 사용자가 볼 화면도 달라야 합니다.
    if (!isValidBattletag(battletag)) {
      return res.status(422).json({ error: 'BATTLETAG_INVALID' });
    }

    const summary = await fetchPlayerSummary(battletag);

    // 개인 데이터라 공유 캐시에 들어가면 안 되고, 브라우저 캐시도 두지 않습니다.
    // TanStack Query가 캐시를 관리하는데 HTTP 캐시가 겹치면 invalidate가
    // 통하지 않고 로그아웃 뒤에도 남습니다. 캐시 주체는 하나여야 합니다.
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
