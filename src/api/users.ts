import { api } from './axios';

interface CheckDuplicateParams {
  field: 'username' | 'battletag';
  value: string;
}

// 본인 문서 제외는 서버가 토큰으로 판단한다
export const checkDuplicate = async ({
  field,
  value,
}: CheckDuplicateParams): Promise<boolean> => {
  if (!value) return false;

  const { data } = await api.post<{ isDuplicate: boolean }>(
    '/api/users/check-duplicate',
    { field, value },
  );

  // 모양이 다르면(SPA 폴백 등) undefined가 "중복 아님"으로 통과한다. 모르면 막는다.
  if (typeof data?.isDuplicate !== 'boolean') {
    throw new Error('중복 검사 응답 형식이 올바르지 않습니다.');
  }

  return data.isDuplicate;
};
