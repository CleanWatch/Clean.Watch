/* src/utils/reportErrors.ts */

/**
 * 같은 태그를 24시간 안에 다시 신고했을 때. 서버가 409로 돌려줍니다.
 *
 * 문자열 비교(`error.message === 'ALREADY_REPORTED'`)로는 **남은 시간을 같이
 * 나를 수 없어서** 클래스로 둡니다. 언제 풀리는지 알려주지 않으면 사용자는
 * 될 때까지 눌러보는 수밖에 없습니다.
 */
export class AlreadyReportedRecentlyError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super('ALREADY_REPORTED_RECENTLY');
    this.name = 'AlreadyReportedRecentlyError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
