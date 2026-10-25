import { Timestamp } from 'firebase-admin/firestore';
import { getAdminFirestore } from './firebaseAdmin.js';

/** 남은 시간을 같이 내려야 해서 호출부가 직접 429로 바꾼다. */
export class ThrottleError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super('TOO_MANY_REQUESTS');
    this.name = 'ThrottleError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * uid별 고정 창 호출 제한.
 *
 * OverFast 레이트 리밋은 호출자 IP 기준인데 그 IP가 우리 서버라, 한 명이 긁으면
 * 모든 사용자의 전적 조회가 같이 막힌다. 서로 다른 태그를 넣는 공격이라 캐시로는 못 막는다.
 * 동시 요청이 같은 count를 읽고 둘 다 통과하지 않도록 트랜잭션으로 처리한다.
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

    // 문서가 없으면 startedAt이 0이라 여기로 온다
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
