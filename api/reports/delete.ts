/* api/reports/delete.ts */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireAdmin, toErrorResponse } from '../_lib/auth.js';

/**
 * 관리자의 신고 삭제 + 랭킹 카운트 동기화.
 *
 * 클라이언트(src/api/admin.ts)에서 하던 일을 옮겨왔습니다. battletags 클라이언트
 * 쓰기를 차단하면 그 경로가 깨지므로 함께 이관해야 합니다.
 *
 * 권한 검사도 서버로 왔습니다. 예전에는 Firestore 규칙의 isAdmin()만이
 * 방어선이었는데, 규칙은 문서 단위 판단만 하므로 "삭제와 카운트 차감이 짝을 이루는지"는
 * 강제하지 못했습니다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { reportId } = req.body ?? {};

  if (typeof reportId !== 'string' || !reportId) {
    return res.status(400).json({ error: 'Bad Request: Missing reportId' });
  }

  try {
    await requireAdmin(req);
    const db = getAdminFirestore();

    const reportRef = db.collection('reports').doc(reportId);

    await db.runTransaction(async (tx) => {
      const reportSnap = await tx.get(reportRef);
      if (!reportSnap.exists) {
        // 이미 지워진 신고. 카운트를 또 깎으면 실제보다 낮아집니다.
        return;
      }

      // 대상 배틀태그는 신고 문서에서 읽습니다.
      // 본문으로 받으면 엉뚱한 배틀태그의 카운트를 깎을 수 있습니다.
      const tag = reportSnap.data()?.battletag as string | undefined;
      const tagRef = tag ? db.collection('battletags').doc(tag) : null;
      const tagSnap = tagRef ? await tx.get(tagRef) : null;

      tx.delete(reportRef);

      if (tagRef && tagSnap?.exists) {
        const count = (tagSnap.data()?.count as number) ?? 1;
        if (count <= 1) {
          // 마지막 신고였으면 랭킹에서 아예 제거
          tx.delete(tagRef);
        } else {
          tx.update(tagRef, { count: FieldValue.increment(-1) });
        }
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Report Delete Error]:', error);
    const { status, body } = toErrorResponse(error);
    return res.status(status).json(body);
  }
}
