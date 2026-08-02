/* src/api/report.ts */

import axios from 'axios';
import { auth } from '@/firebase/firebase';

/**
 * 신고 접수.
 *
 * 예전에는 여기서 중복 검사와 Firestore 쓰기를 모두 수행했습니다. 검사가
 * 클라이언트에만 있어 강제되지 않았고, battletags 카운트를 직접 올릴 수 있어
 * 신고 없이 숫자만 부풀리는 조작이 가능했습니다.
 *
 * 지금은 서버가 검사와 쓰기를 한 트랜잭션으로 처리합니다.
 *
 * reporterUid는 호출부 호환을 위해 남겨두지만 전송하지 않습니다.
 * 서버가 ID 토큰에서 꺼내며, 본문을 믿으면 남의 명의로 신고할 수 있습니다.
 */
export const submitNewReport = async (
  _reporterUid: string,
  battletag: string,
  reason: string,
  details: string,
) => {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('인증 정보가 없습니다.');

  try {
    await axios.post(
      '/api/reports/create',
      { battletag, reason, details },
      { headers: { Authorization: `Bearer ${idToken}` } },
    );
  } catch (error) {
    // 호출부(useReport)가 이 메시지로 중복 신고를 구분하므로 형태를 유지합니다.
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new Error('ALREADY_REPORTED', { cause: error });
    }
    throw error;
  }
};
