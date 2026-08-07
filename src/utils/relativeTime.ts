/* src/utils/relativeTime.ts */

/**
 * ISO 시각을 "3일 전"처럼 사람이 읽는 표현으로 바꿉니다.
 *
 * `Intl.RelativeTimeFormat`은 브라우저 내장이라 날짜 라이브러리를 넣지 않아도
 * 한국어 표현이 그대로 나옵니다.
 *
 * `numeric: 'always'`인 이유 — 'auto'로 두면 1일 전이 "어제", 1개월 전이 "지난달"이
 * 됩니다. 문장으로는 자연스럽지만 여기서는 **얼마나 최근인지 견주는 값**으로 읽히므로
 * 단위를 일정하게 유지하는 편이 낫습니다. "지난달"은 3주 전인지 6주 전인지 모릅니다.
 */
const FORMATTER = new Intl.RelativeTimeFormat('ko', { numeric: 'always' });

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export const formatRelativeTime = (iso?: string | null): string | null => {
  if (!iso) return null;

  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;

  // 초 단위. 과거일수록 커집니다.
  const elapsed = (Date.now() - target) / 1000;

  // 기기 시계가 앞서 있으면 음수가 나와 "1분 후" 같은 문구가 됩니다.
  // 사용자에게 의미가 없으므로 1분 미만과 함께 눌러둡니다.
  if (elapsed < MINUTE) return '방금';

  if (elapsed < HOUR) {
    return FORMATTER.format(-Math.floor(elapsed / MINUTE), 'minute');
  }
  if (elapsed < DAY) {
    return FORMATTER.format(-Math.floor(elapsed / HOUR), 'hour');
  }
  if (elapsed < MONTH) {
    return FORMATTER.format(-Math.floor(elapsed / DAY), 'day');
  }
  if (elapsed < YEAR) {
    return FORMATTER.format(-Math.floor(elapsed / MONTH), 'month');
  }
  return FORMATTER.format(-Math.floor(elapsed / YEAR), 'year');
};

/**
 * 남은 초를 "5시간 후"처럼 바꿉니다. 위 함수는 과거 전용이라 따로 둡니다.
 *
 * 시각이 아니라 **초를 받는** 이유 — 서버가 남은 시간을 재서 보내면 기기 시계가
 * 틀어져 있어도 값이 맞습니다. 시각을 받아 클라이언트가 빼면 시계 오차가
 * 그대로 오차가 됩니다.
 *
 * 내림이 아니라 **올림**입니다. 90초 남았는데 "1분 후"라고 하면 와서 또 막힙니다.
 */
export const formatTimeUntil = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= MINUTE) return '잠시 후';
  if (seconds < HOUR) return `${Math.ceil(seconds / MINUTE)}분 후`;
  return `${Math.ceil(seconds / HOUR)}시간 후`;
};
