import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireUid, toErrorResponse } from '../_lib/auth.js';

// 달력일이 아니라 롤링 24시간. 서버는 UTC, 사용자는 KST라 "같은 날"로 자르면 어긋난다.
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

class CooldownError extends Error {
  constructor() {
    super('ALREADY_REPORTED_RECENTLY');
    this.name = 'CooldownError';
  }
}

/**
 * 신고 접수. 중복 검사와 쓰기를 한 트랜잭션으로 묶는다.
 * 재신고는 24시간에 1회 허용하되 battletags.count는 "몇 명"이라 올리지 않는다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let retryAfterSeconds = 0;

  try {
    // 본문보다 인증을 먼저 봐야 401 자리에 400이 안 나온다
    const reporterUid = await requireUid(req);

    const { battletag, reason, details } = req.body ?? {};

    if (!battletag || typeof battletag !== 'string') {
      return res.status(400).json({ error: 'Bad Request: Missing battletag' });
    }
    if (!reason || typeof reason !== 'string') {
      return res.status(400).json({ error: 'Bad Request: Missing reason' });
    }
    const db = getAdminFirestore();

    const tag = battletag.trim();

    const battletagRef = db.collection('battletags').doc(tag);
    const reportRef = db.collection('reports').doc();
    // 신고자별 마커. id가 uid라 트랜잭션 안에서 점 조회가 된다.
    const markerRef = battletagRef.collection('reporters').doc(reporterUid);

    await db.runTransaction(async (tx) => {
      const [tagSnap, markerSnap] = await Promise.all([
        tx.get(battletagRef),
        tx.get(markerRef),
      ]);

      let isFirstByReporter = !markerSnap.exists;

      if (markerSnap.exists) {
        const lastAt = markerSnap.data()?.lastAt as
          { toMillis?: () => number } | undefined;
        const lastMillis = lastAt?.toMillis?.() ?? 0;
        const elapsed = Date.now() - lastMillis;

        if (elapsed < COOLDOWN_MS) {
          // 시각 대신 남은 초를 준다. 기기 시계가 틀려도 정확하게.
          retryAfterSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
          throw new CooldownError();
        }
      } else {
        // 마커 도입 전 신고가 있으면 첫 신고가 아니다. 사람·태그당 최대 한 번만 돈다.
        const legacy = await tx.get(
          db
            .collection('reports')
            .where('reporterUid', '==', reporterUid)
            .where('battletag', '==', tag)
            .limit(1),
        );
        if (!legacy.empty) isFirstByReporter = false;
      }

      tx.set(reportRef, {
        battletag: tag,
        reason: reason.trim(),
        details: typeof details === 'string' ? details.trim() : '',
        reporterUid,
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.set(
        markerRef,
        {
          lastAt: FieldValue.serverTimestamp(),
          ...(markerSnap.exists
            ? {}
            : { firstAt: FieldValue.serverTimestamp() }),
        },
        { merge: true },
      );

      if (tagSnap.exists) {
        tx.update(battletagRef, {
          lastReportedAt: FieldValue.serverTimestamp(),
          ...(isFirstByReporter ? { count: FieldValue.increment(1) } : {}),
        });
      } else {
        // 문서를 새로 만들면 지금 신고자가 곧 한 명이다
        tx.set(battletagRef, {
          battletag: tag,
          count: 1,
          lastReportedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    if (error instanceof CooldownError) {
      return res.status(409).json({
        error: 'ALREADY_REPORTED_RECENTLY',
        retryAfterSeconds,
      });
    }

    console.error('[Report Create Error]:', error);
    const { status, body } = toErrorResponse(error);
    return res.status(status).json(body);
  }
}
