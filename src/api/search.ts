/* src/api/search.ts */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

// 파이어베이스에서 가져올 문서 데이터의 타입 정의
export interface SearchResultData {
  id: string;
  battletag: string; // DB에 저장된 배틀태그
  count: number; // DB에 저장된 원본 신고 횟수
  reportCount: number; // 프론트엔드 UI 호환용으로 가공된 신고 횟수
}

// 오직 배틀태그 검색만 수행하는 순수 통신 함수
//
// "기록이 없음"은 null이 아니라 false로 돌려줍니다. 화면 쪽은 null을
// "아직 검색하지 않음"으로 쓰고 있어서, 여기서 null을 주면 신고 이력이 없는
// 유저를 검색했을 때 아무것도 그리지 않습니다.
export const fetchSearchResult = async (
  targetTag: string,
): Promise<SearchResultData | false> => {
  const q = query(
    collection(db, 'battletags'),
    where('battletag', '==', targetTag),
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const tagDoc = querySnapshot.docs[0];
    const data = tagDoc.data();

    return {
      id: tagDoc.id,
      battletag: data.battletag,
      count: data.count,
      reportCount: data.count, // 기존 컴포넌트 호환성을 위해 count를 reportCount로 매핑
    };
  }

  return false;
};
