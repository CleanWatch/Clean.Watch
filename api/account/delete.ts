import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminAuth, getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireUid, toErrorResponse } from '../_lib/auth.js';

/**
 * 탈퇴자 신고에 남길 reporterUid.
 *
 * 사람마다 달라야 한다. reports/delete.ts가 reporterUid로 "그 사람의 마지막 신고"를
 * 판정하므로, 값이 하나면 여러 탈퇴자가 한 명으로 합쳐져 카운트가 덜 깎인다.
 * 소금은 안 쓴다. reports는 원본 uid를 보던 관리자만 읽을 수 있어 얻는 게 없다.
 */
const anonymizedUid = (uid: string) =>
  `deleted__${createHash('sha256').update(uid).digest('hex').slice(0, 16)}`;

/** Firestore 배치 쓰기 한도 */
const BATCH_LIMIT = 500;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const uid = await requireUid(req);

    const adminAuth = getAdminAuth();
    const db = getAdminFirestore();

    // 신고 문서는 남기고 작성자만 익명화한다. 지우면 카운트와 어긋난다.
    const reportsSnap = await db
      .collection('reports')
      .where('reporterUid', '==', uid)
      .get();

    const anonymized = anonymizedUid(uid);

    for (let i = 0; i < reportsSnap.docs.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      for (const doc of reportsSnap.docs.slice(i, i + BATCH_LIMIT)) {
        batch.update(doc.ref, { reporterUid: anonymized });
      }
      await batch.commit();
    }

    // 재신고 쿨다운 마커는 문서 id가 uid라 남기면 익명화가 무의미해진다
    const reportedTags = new Set(
      reportsSnap.docs
        .map((doc) => doc.data()?.battletag as string | undefined)
        .filter((tag): tag is string => !!tag),
    );

    const markerRefs = [...reportedTags].map((tag) =>
      db.collection('battletags').doc(tag).collection('reporters').doc(uid),
    );

    for (let i = 0; i < markerRefs.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      for (const ref of markerRefs.slice(i, i + BATCH_LIMIT)) {
        batch.delete(ref);
      }
      await batch.commit();
    }

    await db.collection('users').doc(uid).delete();

    // 인증 계정은 반드시 마지막에 지운다. 앞 단계가 실패해도 재시도로 수습할 수 있게.
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
