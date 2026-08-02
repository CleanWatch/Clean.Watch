/* api/_lib/auth.ts */

import type { VercelRequest } from '@vercel/node';
import { getAdminAuth, getAdminFirestore } from './firebaseAdmin.js';

/**
 * 호출부가 상태 코드로 변환할 수 있도록 구분되는 에러.
 *
 * 401 — 토큰이 없거나 유효하지 않음
 * 403 — 인증은 됐지만 권한이 부족함
 */
export class AuthError extends Error {
  // 생성자 파라미터 프로퍼티는 tsconfig의 erasableSyntaxOnly가 막습니다.
  readonly status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

/**
 * Authorization 헤더의 ID 토큰을 검증하고 uid를 돌려줍니다.
 *
 * **요청 본문의 uid는 절대 신뢰하면 안 됩니다.** 본문을 믿으면 세션만 있으면
 * 남의 계정으로 행동할 수 있습니다. 항상 이 함수가 돌려준 값만 사용하세요.
 */
export const requireUid = async (req: VercelRequest): Promise<string> => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AuthError(401, 'Unauthorized: Missing token');
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(header.slice(7));
    return decoded.uid;
  } catch {
    throw new AuthError(401, 'Unauthorized: Invalid token');
  }
};

/**
 * 토큰이 있으면 uid를, 없거나 유효하지 않으면 null을 돌려줍니다.
 *
 * 회원가입 시점처럼 아직 계정이 없는 경로에서 씁니다. 그런 곳에서
 * requireUid를 쓰면 가입 자체가 막힙니다.
 */
export const optionalUid = async (
  req: VercelRequest,
): Promise<string | null> => {
  try {
    return await requireUid(req);
  } catch {
    return null;
  }
};

/**
 * 관리자인지 확인합니다.
 *
 * role은 users 문서에서 읽습니다. firestore.rules가 클라이언트의 role 수정을
 * 막고 있어(`!changedKeys().hasAny(['role', ...])`) 이 값을 신뢰할 수 있습니다.
 * 그 방어가 풀리면 여기도 함께 무너집니다.
 */
export const requireAdmin = async (req: VercelRequest): Promise<string> => {
  const uid = await requireUid(req);

  const snap = await getAdminFirestore().collection('users').doc(uid).get();
  if (snap.data()?.role !== 'admin') {
    throw new AuthError(403, 'Forbidden: Admin only');
  }

  return uid;
};

/** AuthError면 해당 상태 코드를, 그 외에는 500을 돌려줍니다. */
export const toErrorResponse = (
  error: unknown,
): { status: number; body: { error: string } } => {
  if (error instanceof AuthError) {
    return { status: error.status, body: { error: error.message } };
  }
  return { status: 500, body: { error: 'Internal Server Error' } };
};
