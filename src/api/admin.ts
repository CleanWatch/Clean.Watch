import { db } from '@/firebase/firebase';
import { api } from './axios';
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

interface AdminReport {
  id: string;
  battletag: string;
  reason: string;
  details: string;
  reporterUid: string;
  createdAt: Timestamp;
}

// 읽기는 클라이언트에서 한다. 관리자가 아니면 규칙이 permission-denied로 막는다.
export const fetchAdminReports = async (): Promise<AdminReport[]> => {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AdminReport[];
};

// 대상 태그는 서버가 신고 문서에서 읽는다
export const deleteReportAndSyncRanking = async (reportId: string) => {
  await api.post('/api/reports/delete', { reportId });
};
