import {
  collection,
  getAggregateFromServer,
  sum,
  count,
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export interface HomeStatsData {
  reportCount: number;
  battleTagCount: number;
}

// 홈 화면 누적 통계. 집계 쿼리라 읽기 비용이 1회다.
export const fetchHomeStats = async (): Promise<HomeStatsData> => {
  const battletagsRef = collection(db, 'battletags');

  const snapshot = await getAggregateFromServer(battletagsRef, {
    totalBattleTags: count(),
    totalReports: sum('count'),
  });

  return {
    battleTagCount: snapshot.data().totalBattleTags,
    reportCount: snapshot.data().totalReports,
  };
};
