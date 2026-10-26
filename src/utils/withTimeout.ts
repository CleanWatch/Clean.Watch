// getAuthErrorMessage가 Firebase 에러처럼 code로 식별한다
class TimeoutError extends Error {
  readonly code = 'app/timeout';

  constructor(message = '요청 시간이 초과되었습니다.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Firebase Auth SDK는 응답이 없어도 포기하지 않아서 직접 끊는다.
 * 원본 프로미스를 중단하진 못한다. 결과만 버린다.
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
