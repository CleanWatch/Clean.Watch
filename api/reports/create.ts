/* api/reports/create.ts */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireUid, toErrorResponse } from '../_lib/auth.js';

/**
 * 같은 사람이 같은 태그를 다시 신고할 수 있게 되기까지의 간격.
 *
 * **달력일이 아니라 롤링 24시간입니다.** 서버는 UTC로 도는데 사용자는 KST라,
 * "같은 날"로 자르면 08:00 KST와 10:00 KST가 UTC 기준 다른 날이 되어 두 시간
 * 만에 두 번 신고됩니다. 경과 시간으로 재면 시간대가 계산에 들어오지 않습니다.
 */
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** 트랜잭션을 되돌리기 위한 신호. 아래 catch에서 409로 바뀝니다. */
class CooldownError extends Error {
  constructor() {
    super('ALREADY_REPORTED_RECENTLY');
    this.name = 'CooldownError';
  }
}

/**
 * 신고 접수.
 *
 * 예전에는 브라우저가 세 단계를 순차 실행했습니다 — 중복 검사, reports 생성,
 * battletags 카운트 증가. 검사와 쓰기가 분리되어 서로를 강제하지 못하므로,
 * 공격자는 앞의 두 단계를 건너뛰고 카운트만 반복해서 올릴 수 있었습니다.
 * 규칙으로는 "이 쓰기가 중복 검사를 거쳤는가"를 알 수 없어 막을 방법이 없었습니다.
 *
 * 세 단계를 한 함수에 두고 쓰기는 트랜잭션으로 묶습니다.
 *
 * 같은 태그 재신고는 24시간에 한 번 허용하되 `battletags.count`는 올리지 않습니다.
 * count는 "몇 건"이 아니라 **몇 명**이어야 하기 때문입니다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 트랜잭션 안에서 채우고 catch에서 읽으므로 try 바깥에 둡니다.
  let retryAfterSeconds = 0;

  try {
    // 인증을 먼저 봅니다. 비인증 요청에는 본문을 들여다볼 이유도 없고,
    // 그렇게 해야 401이 나올 자리에 400이 나오지 않습니다.
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
    // 신고자별 마커. 문서 id가 uid라 **점 조회**가 되어 인덱스가 필요 없고,
    // 트랜잭션 안에서 읽을 수 있습니다. 예전 중복 검사는 트랜잭션 밖에 있어
    // 동시 요청 두 건이 나란히 통과하는 창이 있었습니다.
    const markerRef = battletagRef.collection('reporters').doc(reporterUid);

    await db.runTransaction(async (tx) => {
      // 읽기는 전부 쓰기보다 먼저.
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
          // 남은 초를 그대로 돌려줍니다. 시각을 주면 클라이언트가 자기 시계로
          // 빼는데, 기기 시계가 틀어져 있으면 남은 시간이 엉뚱하게 나옵니다.
          retryAfterSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
          throw new CooldownError();
        }
      } else {
        // 마커를 쓰기 전에 남긴 신고가 있을 수 있습니다. 그대로 "첫 신고"로 보면
        // 카운트가 한 번 더 올라갑니다. 마커가 없을 때만 도는 보정이라
        // 한 사람·한 태그당 최대 한 번입니다. 마이그레이션 스크립트가 필요 없습니다.
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

      // count는 **몇 명이 신고했나**입니다. 같은 사람의 재신고로는 올리지 않습니다.
      // 한 사람이 한 달에 30을 만들 수 있게 되면, 식별 가능한 사람에 대한 공개
      // 고발에서 그 숫자가 근거를 잃습니다.
      if (tagSnap.exists) {
        tx.update(battletagRef, {
          lastReportedAt: FieldValue.serverTimestamp(),
          ...(isFirstByReporter ? { count: FieldValue.increment(1) } : {}),
        });
      } else {
        // 문서를 새로 만드는 경우입니다. isFirstByReporter가 false여도(마커는 없는데
        // 옛 신고가 남아 있는 상태) **지금 신고하는 이 사람이 곧 한 명**이므로 1입니다.
        // 0으로 두면 검색 결과가 "0번 신고되었습니다"가 됩니다.
        tx.set(battletagRef, {
          battletag: tag,
          count: 1,
          lastReportedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    // 쿨다운은 오류가 아니라 정상적인 거절입니다. 언제 풀리는지까지 알려주지 않으면
    // 사용자는 될 때까지 눌러보는 수밖에 없습니다.
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
