/* src/types/search.ts */

/**
 * 배틀태그 검색 결과. `battletags` 컬렉션 문서 하나에 대응합니다.
 *
 * 예전에는 이 형태가 `src/api/search.ts`와 `SearchResult.tsx`에 **따로** 정의되어
 * 있었습니다. 필드를 하나 늘리려면 두 곳을 고쳐야 했고, 한쪽만 고치면 화면은
 * 멀쩡히 컴파일되면서 값만 조용히 사라집니다.
 */
export interface SearchResultData {
  battletag: string;

  /** 이 태그를 신고한 횟수. Firestore의 `count` 필드입니다. */
  reportCount: number;
}
