// api/_lib/overfast.ts에 같은 정규식이 있다. 함께 고칠 것.
export const isValidBattletag = (tag?: string | null): boolean => {
  if (!tag) return false;
  const cleanTag = tag.trim();
  const regex = /^[a-zA-Z가-힣][a-zA-Z0-9가-힣]{1,11}#[0-9]{4,5}$/;
  return regex.test(cleanTag);
};

export const BATTLETAG_EXAMPLE = 'Player#1234';

export const BATTLETAG_FORMAT_ERROR =
  '배틀태그 형식이 올바르지 않습니다. # 뒤는 숫자 4~5자리입니다.';

// 라벨이 안 보이는 입력칸(검색·신고)용. 설명을 붙이면 모바일에서 예시가 잘린다.
export const BATTLETAG_PLACEHOLDER = `예: ${BATTLETAG_EXAMPLE}`;

export const isValidEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const isValidUsername = (username?: string | null): boolean => {
  if (!username) return false;
  const regex = /^[a-zA-Z0-9가-힣]{2,12}$/;
  return regex.test(username);
};

export const isValidPassword = (password?: string | null): boolean => {
  if (!password) return false;
  return password.length >= 6;
};

/**
 * 에러 문구를 돌려준다 (문제없으면 ''). boolean이 아니다.
 * emptyMsg가 null이면 빈 값을 허용한다 (배틀태그 연동 해제).
 */
export const getFieldError = (
  value: string,
  emptyMsg: string | null,
  validator: (val: string) => boolean,
  invalidMsg: string,
): string => {
  if (emptyMsg && !value) return emptyMsg;
  if (value && !validator(value)) return invalidMsg;
  return '';
};
