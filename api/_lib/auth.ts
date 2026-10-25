import type { VercelRequest } from '@vercel/node';
import { getAdminAuth, getAdminFirestore } from './firebaseAdmin.js';

/** 401: 토큰 없음·무효, 403: 권한 부족 */
export class AuthError extends Error {
  // erasableSyntaxOnly라 생성자 파라미터 프로퍼티를 못 쓴다
  readonly status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

/** ID 토큰을 검증해 uid를 돌려준다. 요청 본문의 uid는 믿지 말고 항상 이 값을 쓴다. */
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

/** 회원가입처럼 계정이 아직 없는 경로용. 토큰이 없으면 null. */
export const optionalUid = async (
  req: VercelRequest,
): Promise<string | null> => {
  try {
    return await requireUid(req);
  } catch {
    return null;
  }
};

/** role은 firestore.rules가 클라이언트 수정을 막고 있어서 신뢰할 수 있다. */
export const requireAdmin = async (req: VercelRequest): Promise<string> => {
  const uid = await requireUid(req);

  const snap = await getAdminFirestore().collection('users').doc(uid).get();
  if (snap.data()?.role !== 'admin') {
    throw new AuthError(403, 'Forbidden: Admin only');
  }

  return uid;
};

export const toErrorResponse = (
  error: unknown,
): { status: number; body: { error: string } } => {
  if (error instanceof AuthError) {
    return { status: error.status, body: { error: error.message } };
  }
  return { status: 500, body: { error: 'Internal Server Error' } };
};
