/* src/utils/validations.ts */

// 1. 배틀태그 검증 (블리자드 오피셜 정규식 적용)
export const isValidBattletag = (tag?: string | null): boolean => {
  if (!tag) return false;
  const cleanTag = tag.trim();
  // 첫 글자는 영문/한글, 두 번째부터 숫자 포함 2~12글자, # 뒤에 숫자 4~5자리
  const regex = /^[a-zA-Z가-힣][a-zA-Z0-9가-힣]{1,11}#[0-9]{4,5}$/;
  return regex.test(cleanTag);
};

/**
 * 배틀태그 예시와 형식 오류 문구.
 *
 * 정규식 바로 밑에 두는 이유는 **문구가 위 규칙을 말로 옮긴 것**이기 때문입니다.
 * "4~5자리"는 위 `{4,5}`에서 온 값이라, 규칙을 고치면 이 문장도 같이 고쳐야 합니다.
 * 멀리 떨어뜨리면 한쪽만 바뀝니다.
 *
 * 상수로 묶은 이유: 검색·가입·설정·신고 네 화면이 각자 예시를 하드코딩한 결과
 * 여섯 종류(트레이서·홍길동·Justice·Hacker·비매너유저·닉네임)로 갈렸고,
 * **같은 입력창의 안내와 오류가 서로 다른 예시를 보여주고** 있었습니다.
 */
export const BATTLETAG_EXAMPLE = 'Player#1234';

export const BATTLETAG_FORMAT_ERROR =
  '배틀태그 형식이 올바르지 않습니다. # 뒤는 숫자 4~5자리입니다.';

// 2. 이메일 형식 검사
export const isValidEmail = (email?: string | null): boolean => {
  if (!email) return false;
  // 영문, 숫자, 허용된 특수문자(._%+-) 조합 @ 도메인.최상위도메인(2글자 이상)
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// 3. 닉네임 형식 검사 (특수문자 제외, 한글/영문/숫자 2~12자)
export const isValidUsername = (username?: string | null): boolean => {
  if (!username) return false;
  const regex = /^[a-zA-Z0-9가-힣]{2,12}$/;
  return regex.test(username);
};

// 4. 비밀번호 형식 검사 (최소 6자리 이상)
export const isValidPassword = (password?: string | null): boolean => {
  if (!password) return false;
  return password.length >= 6;
};

/**
 * 값 하나를 검사해 **에러 문구**를 돌려줍니다. 문제가 없으면 빈 문자열입니다.
 *
 * 반환값이 boolean이 아니라 문구라는 점에 주의하세요. 이름이 validate~였을 때
 * `if (validateField(...))`처럼 쓰면 "에러가 있을 때 참"이라 의미가 뒤집힙니다.
 *
 * emptyMsg에 null을 주면 빈 값을 허용합니다 — 배틀태그처럼 지워서 연동을
 * 해제하는 것이 정상 동작인 경우에 씁니다.
 *
 * 가입 화면과 프로필 설정이 같은 규칙을 각자 구현하다 어긋났기 때문에
 * (설정 쪽에는 형식 검사가 아예 없었습니다) 여기로 옮겨 공유합니다.
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
