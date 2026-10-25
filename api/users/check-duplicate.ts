import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { optionalUid, toErrorResponse } from '../_lib/auth.js';

const ALLOWED_FIELDS = ['username', 'battletag'] as const;
type Field = (typeof ALLOWED_FIELDS)[number];

const isAllowedField = (v: unknown): v is Field =>
  typeof v === 'string' && (ALLOWED_FIELDS as readonly string[]).includes(v);

/**
 * 닉네임·배틀태그 중복 검사.
 * 규칙은 필드 단위로 못 가려서, 클라이언트가 users를 직접 읽으면 email까지 노출된다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { field, value } = req.body ?? {};

  // 아무 필드나 받으면 이메일 가입 여부 같은 걸 탐지할 수 있다
  if (!isAllowedField(field)) {
    return res.status(400).json({ error: 'Bad Request: Invalid field' });
  }

  if (typeof value !== 'string' || !value) {
    return res.status(200).json({ isDuplicate: false });
  }

  try {
    // 가입 시점엔 토큰이 없다. 있으면 본인 문서를 제외하는 데 쓴다.
    const currentUid = await optionalUid(req);

    const snap = await getAdminFirestore()
      .collection('users')
      .where(field, '==', value)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(200).json({ isDuplicate: false });
    }

    const isSelf = currentUid !== null && snap.docs[0].id === currentUid;

    return res.status(200).json({ isDuplicate: !isSelf });
  } catch (error) {
    console.error('[Check Duplicate Error]:', error);
    const { status, body } = toErrorResponse(error);
    return res.status(status).json(body);
  }
}
