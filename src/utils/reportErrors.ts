// 남은 시간을 실어 보내려고 문자열 대신 클래스로 둔다
export class AlreadyReportedRecentlyError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super('ALREADY_REPORTED_RECENTLY');
    this.name = 'AlreadyReportedRecentlyError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
