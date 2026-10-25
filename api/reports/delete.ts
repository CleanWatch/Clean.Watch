import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireAdmin, toErrorResponse } from '../_lib/auth.js';

/** 관리자 신고 삭제. 삭제와 카운트 차감을 한 트랜잭션으로 묶는다. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await requireAdmin(req);

    const { reportId } = req.body ?? {};

    if (typeof reportId !== 'string' || !reportId) {
      return res.status(400).json({ error: 'Bad Request: Missing reportId' });
    }
    const db = getAdminFirestore();

    const reportRef = db.collection('reports').doc(reportId);

    await db.runTransaction(async (tx) => {
      const reportSnap = await tx.get(reportRef);
      if (!reportSnap.exists) {
        // 이미 지워졌으면 카운트를 또 깎지 않는다
        return;
      }

      // 태그는 본문이 아니라 신고 문서에서 읽는다
      const reportData = reportSnap.data();
      const tag = reportData?.battletag as string | undefined;
      const reporterUid = reportData?.reporterUid as string | undefined;

      const tagRef = tag ? db.collection('battletags').doc(tag) : null;
      const tagSnap = tagRef ? await tx.get(tagRef) : null;

      // count는 "몇 명"이라 그 사람의 마지막 한 건일 때만 줄인다.
      // 지우는 문서 말고 하나라도 더 있으면 마지막이 아니므로 limit(2)면 된다.
      let isReportersLast = true;
      if (tag && reporterUid) {
        const siblings = await tx.get(
          db
            .collection('reports')
            .where('reporterUid', '==', reporterUid)
            .where('battletag', '==', tag)
            .limit(2),
        );
        isReportersLast = siblings.docs.every((doc) => doc.id === reportId);
      }

      tx.delete(reportRef);

      // 마커를 남기면 신고가 없는데 쿨다운만 걸린다.
      // 태그 문서가 없어도 하위 컬렉션은 남을 수 있어 tagSnap과 무관하게 지운다.
      if (tagRef && reporterUid && isReportersLast) {
        tx.delete(tagRef.collection('reporters').doc(reporterUid));
      }

      if (tagRef && tagSnap?.exists && isReportersLast) {
        const count = (tagSnap.data()?.count as number) ?? 1;
        if (count <= 1) {
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
