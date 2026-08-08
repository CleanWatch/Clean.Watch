/* api/account/delete.ts */

import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminAuth, getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireUid, toErrorResponse } from '../_lib/auth.js';

/**
 * 탈퇴한 유저의 신고에 남길 값.
 *
 * 신고 문서 자체는 유지해 battletags 카운트가 흔들리지 않게 하고,
 * 누가 넣었는지만 지웁니다.
 *
 * **사람별로 다른 값이어야 합니다.** 예전에는 전부 `'deleted'` 하나로 바꿨는데,
 * `api/reports/delete.ts`가 `reporterUid`로 "같은 사람의 마지막 신고인지"를 판정하기
 * 때문에 **서로 다른 탈퇴자들이 한 명으로 합쳐졌습니다.** 그러면 관리자가 그 신고들을
 * 지울 때 카운트가 덜 깎여, 신고 문서는 0건인데 검색·랭킹에는 숫자가 남는 유령이
 * 생깁니다. `battletags.count`가 "몇 명"이라는 정의가 깨지는 지점입니다.
 *
 * 해시라 원래 uid로 되돌릴 수 없어 익명성은 그대로고, 같은 uid는 늘 같은 값이 되어
 * 한 사람의 신고들이 정확히 묶입니다.
 *
 * 소금은 쓰지 않습니다. reports는 관리자만 읽을 수 있고 관리자는 탈퇴 전 원본 uid를
 * 볼 수 있던 사람이라 대조를 막아도 얻는 게 없는 반면, 소금 값이 바뀌면 과거 익명화와
 * 이어지지 않는 운영 부담이 실재합니다.
 */
const anonymizedUid = (uid: string) =>
  `deleted__${createHash('sha256').update(uid).digest('hex').slice(0, 16)}`;

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

    const anonymized = anonymizedUid(uid);

    for (let i = 0; i < reportsSnap.docs.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      for (const doc of reportsSnap.docs.slice(i, i + BATCH_LIMIT)) {
        batch.update(doc.ref, { reporterUid: anonymized });
      }
      await batch.commit();
    }

    // Step A2: 재신고 쿨다운 마커 삭제
    //
    // battletags/{tag}/reporters/{uid} 는 문서 id가 uid라, 남겨두면 사라진 계정과
    // 신고 대상의 연결이 그대로 남습니다. 익명화를 하는 마당에 이것만 남길 이유가
    // 없습니다. 대상 태그는 위에서 읽은 신고 문서에서 뽑습니다.
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
