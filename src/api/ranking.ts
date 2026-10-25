import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export interface RankingData {
  id: string;
  battletag: string;
  reportCount: number;
}

// size가 없으면 전체. 홈 미리보기는 상위 몇 개만 읽어 비용을 줄인다.
export const fetchRanking = async (size?: number): Promise<RankingData[]> => {
  const q = query(
    collection(db, 'battletags'),
    orderBy('count', 'desc'),
    ...(size ? [limit(size)] : []),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      battletag: data.battletag,
      reportCount: data.count || 0,
    };
  });
};
