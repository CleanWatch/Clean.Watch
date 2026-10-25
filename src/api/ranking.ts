import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export interface RankingData {
  id: string;
  battletag: string;
  reportCount: number;
}

export const fetchRanking = async (): Promise<RankingData[]> => {
  const q = query(collection(db, 'battletags'), orderBy('count', 'desc'));

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
