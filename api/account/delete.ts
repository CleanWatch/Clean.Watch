/* api/account/delete.ts */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminAuth, getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireUid, toErrorResponse } from '../_lib/auth.js';

/**
 * 탈퇴한 유저의 신고에 남길 값.
 * 신고 문서 자체는 유지해 battletags 카운트가 흔들리지 않게 하고,
 * 누가 넣었는지만 지웁니다.
 */
const ANONYMIZED_UID = 'deleted';

/** Firestore 배치 쓰기 한도 */
const BATCH_LIMIT = 500;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Method Guard
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 요청 본문의 uid를 신뢰하면 남의 계정을 지울 수 있습니다.
    // 반드시 검증된 토큰에서 꺼낸 uid만 사용합니다.
    const uid = await requireUid(req);

    const adminAuth = getAdminAuth();
    const db = getAdminFirestore();

    // Step A: 신고 익명화
    // reports 문서는 남기고 reporterUid만 바꿉니다. 문서를 지우면
    // battletags 카운트와 어긋나고, 신고 후 탈퇴로 랭킹을 조작할 여지가 생깁니다.
    const reportsSnap = await db
      .collection('reports')
      .where('reporterUid', '==', uid)
      .get();

    for (let i = 0; i < reportsSnap.docs.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      for (const doc of reportsSnap.docs.slice(i, i + BATCH_LIMIT)) {
        batch.update(doc.ref, { reporterUid: ANONYMIZED_UID });
      }
      await batch.commit();
    }

    // Step B: 프로필 문서 삭제
    await db.collection('users').doc(uid).delete();

    // Step C: 인증 계정 삭제 — 반드시 마지막
    // 먼저 지우면 이후 단계가 실패했을 때 "로그인은 불가능한데 데이터는 남은"
    // 복구 불가 상태가 됩니다. 이 순서면 재시도로 수습됩니다.
    await adminAuth.deleteUser(uid);

    return res.status(200).json({
      success: true,
      anonymizedReports: reportsSnap.size,
    });
  } catch (error) {
    console.error('[Account Delete Error]:', error);
    const { status, body } = toErrorResponse(error);
    return res.status(status).json(body);
  }
}
