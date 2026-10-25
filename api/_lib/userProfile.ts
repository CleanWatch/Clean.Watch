import type { Firestore, Transaction } from 'firebase-admin/firestore';

// src/utils/validations.ts에 같은 정규식이 있다. 함께 고칠 것.
const USERNAME_PATTERN = /^[a-zA-Z0-9가-힣]{2,12}$/;

export const isValidUsername = (username?: string | null): boolean =>
  !!username && USERNAME_PATTERN.test(username);

export type ProfileField = 'username' | 'battletag';

/**
 * 다른 사람이 쓰고 있는 값인지. 트랜잭션 안에서 읽어야 같은 값으로 동시에
 * 들어온 요청 중 하나가 재시도되며 걸러진다.
 */
export const isTaken = async (
  db: Firestore,
  tx: Transaction,
  field: ProfileField,
  value: string,
  selfUid: string,
): Promise<boolean> => {
  const snap = await tx.get(
    db.collection('users').where(field, '==', value).limit(2),
  );
  return snap.docs.some((doc) => doc.id !== selfUid);
};

export class ProfileError extends Error {
  readonly status: 400 | 404 | 409;

  constructor(status: 400 | 404 | 409, code: string) {
    super(code);
    this.name = 'ProfileError';
    this.status = status;
  }
}
