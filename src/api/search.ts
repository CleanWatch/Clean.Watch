/* src/api/search.ts */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import type { SearchResultData } from '@/types';

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
      battletag: data.battletag,
      reportCount: data.count,
    };
  }

  return false;
};
