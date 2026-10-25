// battletags 문서 하나
export interface SearchResultData {
  battletag: string;

  /** Firestore의 count (신고한 사람 수) */
  reportCount: number;

  /** ISO. 옛 문서엔 없어서 null이면 화면에서 줄을 안 그린다. */
  lastReportedAt: string | null;
}
