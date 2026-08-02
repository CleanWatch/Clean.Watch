/* api/users/check-duplicate.ts */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { optionalUid, toErrorResponse } from '../_lib/auth.js';

const ALLOWED_FIELDS = ['username', 'battletag'] as const;
type Field = (typeof ALLOWED_FIELDS)[number];

const isAllowedField = (v: unknown): v is Field =>
  typeof v === 'string' && (ALLOWED_FIELDS as readonly string[]).includes(v);

/**
 * 닉네임·배틀태그 중복 검사.
 *
 * 원래 브라우저가 users 컬렉션을 직접 조회했는데, 그러려면 규칙에서 users 읽기를
 * 열어야 했습니다. Firestore 규칙은 필드 단위 제한을 지원하지 않아 username 하나를
 * 읽게 하는 대가로 email까지 노출됐습니다.
 *
 * 서버에서 조회하고 boolean만 돌려주면 클라이언트가 users를 읽을 이유가 사라집니다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { field, value } = req.body ?? {};

  // 임의 필드를 허용하면 users 문서의 아무 값이나 존재 여부를 확인할 수 있습니다.
  // 예: { field: 'email', value: '...' } 로 특정 이메일의 가입 여부 탐지.
  if (!isAllowedField(field)) {
    return res.status(400).json({ error: 'Bad Request: Invalid field' });
  }

  if (typeof value !== 'string' || !value) {
    return res.status(200).json({ isDuplicate: false });
  }

  try {
    // 회원가입 시점에는 아직 계정이 없어 토큰이 없습니다.
    // requireUid를 쓰면 가입 자체가 막히므로 선택적으로 받습니다.
    // 토큰이 있으면 본인 문서를 중복에서 제외하는 데 씁니다.
    const currentUid = await optionalUid(req);

    // limit(1): 중복을 하나라도 찾으면 즉시 종료 (과금 방지)
    const snap = await getAdminFirestore()
      .collection('users')
      .where(field, '==', value)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(200).json({ isDuplicate: false });
    }

    // 찾은 문서가 본인 것이면 중복이 아닙니다 (프로필 수정 시 자기 닉네임 유지)
    const isSelf = currentUid !== null && snap.docs[0].id === currentUid;

    return res.status(200).json({ isDuplicate: !isSelf });
  } catch (error) {
    console.error('[Check Duplicate Error]:', error);
    const { status, body } = toErrorResponse(error);
    return res.status(status).json(body);
  }
}
