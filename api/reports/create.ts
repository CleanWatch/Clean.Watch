/* api/reports/create.ts */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireUid, toErrorResponse } from '../_lib/auth.js';

/**
 * 신고 접수.
 *
 * 예전에는 브라우저가 세 단계를 순차 실행했습니다 — 중복 검사, reports 생성,
 * battletags 카운트 증가. 검사와 쓰기가 분리되어 서로를 강제하지 못하므로,
 * 공격자는 앞의 두 단계를 건너뛰고 카운트만 반복해서 올릴 수 있었습니다.
 * 규칙으로는 "이 쓰기가 중복 검사를 거쳤는가"를 알 수 없어 막을 방법이 없었습니다.
 *
 * 세 단계를 한 함수에 두고 쓰기는 트랜잭션으로 묶습니다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { battletag, reason, details } = req.body ?? {};

  if (typeof battletag !== 'string' || !battletag.trim()) {
    return res.status(400).json({ error: 'Bad Request: Missing battletag' });
  }
  if (typeof reason !== 'string' || !reason.trim()) {
    return res.status(400).json({ error: 'Bad Request: Missing reason' });
  }

  try {
    // 신고자는 검증된 토큰에서만. 본문을 믿으면 남의 명의로 신고할 수 있습니다.
    const reporterUid = await requireUid(req);
    const db = getAdminFirestore();

    const tag = battletag.trim();

    // 중복 신고 검사. 서버에서 하므로 우회할 수 없습니다.
    const existing = await db
      .collection('reports')
      .where('reporterUid', '==', reporterUid)
      .where('battletag', '==', tag)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ error: 'ALREADY_REPORTED' });
    }

    // reports 생성과 battletags 카운트를 한 트랜잭션으로 묶습니다.
    // 따로 쓰면 중간 실패 시 신고는 있는데 카운트는 안 오른 상태가 됩니다.
    const battletagRef = db.collection('battletags').doc(tag);
    const reportRef = db.collection('reports').doc();

    await db.runTransaction(async (tx) => {
      // 트랜잭션 안에서는 모든 읽기가 쓰기보다 먼저 와야 합니다.
      const tagSnap = await tx.get(battletagRef);

      tx.set(reportRef, {
        battletag: tag,
        reason: reason.trim(),
        details: typeof details === 'string' ? details.trim() : '',
        reporterUid,
        createdAt: FieldValue.serverTimestamp(),
      });

      if (tagSnap.exists) {
        tx.update(battletagRef, {
          count: FieldValue.increment(1),
          lastReportedAt: FieldValue.serverTimestamp(),
        });
      } else {
        tx.set(battletagRef, {
          battletag: tag,
          count: 1,
          lastReportedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('[Report Create Error]:', error);
    const { status, body } = toErrorResponse(error);
    return res.status(status).json(body);
  }
}
