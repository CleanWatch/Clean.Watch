/* src/utils/withTimeout.ts */

/** getAuthErrorMessage가 식별할 수 있도록 Firebase 에러와 같은 형태로 code를 답니다. */
export class TimeoutError extends Error {
  readonly code = 'app/timeout';

  constructor(message = '요청 시간이 초과되었습니다.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * 프로미스가 제한 시간 안에 끝나지 않으면 TimeoutError로 거부시킵니다.
 *
 * Firebase Auth SDK는 응답이 오지 않을 때 스스로 포기하지 않습니다.
 * 그대로 두면 mutation의 isPending이 계속 true로 남아 버튼이 "로그인 중..."에
 * 갇히고, 사용자는 취소할 방법도 원인을 알 방법도 없습니다.
 *
 * 서버 쪽 api/auth/discord/callback.ts는 AbortController로 10초 제한을 두고
 * 있으므로 프론트도 같은 수준을 맞춥니다.
 *
 * 주의: 원본 프로미스를 실제로 중단시키지는 못합니다. 뒤늦게 성공하더라도
 * 결과가 버려질 뿐이라, 로그인 시도 자체는 서버에서 완료될 수 있습니다.
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  ms = 10_000,
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new TimeoutError()), ms);
    }),
  ]).finally(() => clearTimeout(timer)) as Promise<T>;
};
