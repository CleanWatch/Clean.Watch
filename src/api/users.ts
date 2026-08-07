/* src/api/users.ts */

import { api } from './axios';

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

  // 로그인 상태면 인터셉터가 토큰을 붙입니다.
  // 회원가입 시점에는 계정이 없어 토큰 없이 나가고, 서버도 그것을 허용합니다.
  const { data } = await api.post<{ isDuplicate: boolean }>(
    '/api/users/check-duplicate',
    { field, value },
  );

  // 모양을 확인하지 않으면 undefined가 그대로 falsy로 읽혀 **중복이 아닌 것으로
  // 통과**합니다. 200이어도 본문이 우리 것이 아닐 수 있으므로(SPA 폴백 등) 여기서
  // 던져야 호출부의 catch가 받아 가입을 막습니다. 모르면 통과가 아니라 막는 쪽으로.
  if (typeof data?.isDuplicate !== 'boolean') {
    throw new Error('중복 검사 응답 형식이 올바르지 않습니다.');
  }

  return data.isDuplicate;
};
