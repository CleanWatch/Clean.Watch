/* src/api/users.ts */

import axios from 'axios';
import { auth } from '@/firebase/firebase';

interface CheckDuplicateParams {
  field: 'username' | 'battletag';
  value: string;
}

/**
 * 닉네임·배틀태그 중복 검사.
 *
 * 예전에는 여기서 Firestore users 컬렉션을 직접 조회했습니다. 그러려면 규칙에서
 * users 읽기를 열어야 했고, 규칙은 필드 단위 제한이 안 되므로 email까지 함께
 * 노출됐습니다. 지금은 서버가 조회하고 boolean만 돌려줍니다.
 *
 * 본인 문서 제외는 서버가 ID 토큰으로 판단합니다. 클라이언트가 보낸 uid를
 * 믿으면 남의 닉네임을 "본인 것"이라고 우길 수 있어, currentUid 인자는 없앴습니다.
 */
export const checkDuplicate = async ({
  field,
  value,
}: CheckDuplicateParams): Promise<boolean> => {
  if (!value) return false;

  // 로그인 상태면 토큰을 실어 보냅니다. 회원가입 시점에는 없으므로 생략됩니다.
  const idToken = await auth.currentUser?.getIdToken();

  const { data } = await axios.post<{ isDuplicate: boolean }>(
    '/api/users/check-duplicate',
    { field, value },
    idToken ? { headers: { Authorization: `Bearer ${idToken}` } } : undefined,
  );

  return data.isDuplicate;
};
