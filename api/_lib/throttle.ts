/* api/_lib/throttle.ts */

import { Timestamp } from 'firebase-admin/firestore';
import { getAdminFirestore } from './firebaseAdmin.js';

/**
 * 쓰로틀에 걸렸을 때. `toErrorResponse`가 아니라 호출부가 직접 429로 바꿉니다 —
 * 남은 시간을 같이 실어 보내야 하기 때문입니다.
 */
export class ThrottleError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super('TOO_MANY_REQUESTS');
    this.name = 'ThrottleError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * uid별 호출 횟수 제한. 창이 지나면 처음부터 다시 셉니다(고정 창 방식).
 *
 * **왜 필요한가** — 배틀태그를 본문으로 받는 엔드포인트는 남의 데이터를 우리를 통해
 * 긁어가는 통로가 됩니다. 상류(OverFast)의 레이트 리밋은 **호출자 IP 기준인데 그 IP가
 * 우리 Vercel 함수**라, 한 명이 수만 건을 넣으면 우리 함수 전체가 막히고 **모든
 * 사용자의 전적 조회가 같이 죽습니다.** `api/stats/me.ts` 주석이 파라미터 엔드포인트를
 * 만들 때 이것을 같은 커밋에서 넣으라고 못박아 둔 이유입니다.
 *
 * 캐시로는 대체할 수 없습니다. 공격은 **서로 다른 태그**를 넣는 것이라 캐시가 안 걸립니다.
 *
 * 문서 id에 bucket과 uid를 함께 넣어 **점 조회**가 되게 합니다(인덱스 불필요).
 * 트랜잭션을 쓰는 이유는 동시 요청 두 건이 같은 count를 읽고 둘 다 통과하는 것을
 * 막기 위해서입니다.
 */
export const consumeQuota = async (
  uid: string,
  bucket: string,
  limit: number,
  windowMs: number,
): Promise<void> => {
  const ref = getAdminFirestore()
    .collection('throttles')
    .doc(`${bucket}__${uid}`);

  await getAdminFirestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();

    const windowStart = snap.data()?.windowStart as Timestamp | undefined;
    const startedAt = windowStart?.toMillis?.() ?? 0;
    const count = (snap.data()?.count as number) ?? 0;

    // 창이 지났으면 처음부터. 문서가 없을 때도 startedAt이 0이라 여기로 옵니다.
    if (now - startedAt >= windowMs) {
      tx.set(ref, { windowStart: Timestamp.fromMillis(now), count: 1 });
      return;
    }

    if (count >= limit) {
      throw new ThrottleError(Math.ceil((startedAt + windowMs - now) / 1000));
    }

    tx.update(ref, { count: count + 1 });
  });
};
