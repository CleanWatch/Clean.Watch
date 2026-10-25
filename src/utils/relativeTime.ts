// numeric: 'auto'면 "지난달"처럼 나와 얼마나 최근인지 비교가 안 된다
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

  const elapsed = (Date.now() - target) / 1000;

  // 기기 시계가 앞서 음수가 나와도 여기서 걸린다
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
 * 남은 초 → "약 5시간 후".
 * 분은 올림(일찍 와서 또 막히지 않게), 시간은 반올림(한 시간 더 기다리게 하지 않게).
 */
export const formatTimeUntil = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= MINUTE) return '잠시 후';

  const minutes = Math.ceil(seconds / MINUTE);
  if (minutes < 60) return `${minutes}분 후`;

  return `약 ${Math.max(1, Math.round(seconds / HOUR))}시간 후`;
};
