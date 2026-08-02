// src/api/admin.ts
import axios from 'axios';
import { db, auth } from '@/firebase/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface AdminReport {
  id: string;
  battletag: string;
  reason: string;
  details: string;
  reporterUid: string;
  createdAt: Timestamp;
}

// 1. 신고 내역 전체 불러오기
// 읽기는 클라이언트에 남깁니다. firestore.rules의 isAdmin()이 막고 있어
// 관리자가 아니면 이 쿼리 자체가 permission-denied로 거부됩니다.
export const fetchAdminReports = async (): Promise<AdminReport[]> => {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AdminReport[];
};

/**
 * 신고 삭제 및 랭킹 카운트 동기화.
 *
 * 예전에는 여기서 Firestore를 직접 조작했습니다. battletags 클라이언트 쓰기를
 * 차단하면 이 경로가 깨지므로 서버로 옮겼습니다. 삭제와 카운트 차감이
 * 트랜잭션으로 묶여 한쪽만 반영되는 일이 없습니다.
 *
 * 대상 배틀태그 인자는 없앴습니다. 서버가 신고 문서에서 직접 읽습니다 —
 * 호출부가 넘긴 값을 믿으면 엉뚱한 배틀태그의 카운트를 깎을 수 있습니다.
 */
export const deleteReportAndSyncRanking = async (reportId: string) => {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('인증 정보가 없습니다.');

  await axios.post(
    '/api/reports/delete',
    { reportId },
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
};
