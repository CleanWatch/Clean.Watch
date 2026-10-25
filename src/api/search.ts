import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import type { SearchResultData } from '@/types';

// 기록 없음은 false. 화면은 null을 "아직 검색 안 함"으로 쓴다.
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
      // 옛 문서엔 이 필드가 없다
      lastReportedAt: data.lastReportedAt?.toDate?.().toISOString() ?? null,
    };
  }

  return false;
};
