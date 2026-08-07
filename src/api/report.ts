/* src/api/report.ts */

import axios from 'axios';
import { api } from './axios';
import { AlreadyReportedRecentlyError } from '@/utils';

/**
 * 신고 접수.
 *
 * 예전에는 여기서 중복 검사와 Firestore 쓰기를 모두 수행했습니다. 검사가
 * 클라이언트에만 있어 강제되지 않았고, battletags 카운트를 직접 올릴 수 있어
 * 신고 없이 숫자만 부풀리는 조작이 가능했습니다.
 *
 * 지금은 서버가 검사와 쓰기를 한 트랜잭션으로 처리합니다.
 *
 * 신고자 uid 인자는 없앴습니다. 서버가 ID 토큰에서 꺼냅니다 —
 * 호출부가 넘긴 값을 믿으면 남의 명의로 신고할 수 있습니다.
 *
 * 로그인하지 않은 상태면 토큰이 없어 서버가 401을 돌려줍니다.
 */
export const submitNewReport = async (
  battletag: string,
  reason: string,
  details: string,
) => {
  try {
    // 토큰은 api 인스턴스의 인터셉터가 붙입니다.
    await api.post('/api/reports/create', { battletag, reason, details });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      const body = error.response.data as
        { error?: string; retryAfterSeconds?: number } | undefined;

      if (body?.error === 'ALREADY_REPORTED_RECENTLY') {
        throw new AlreadyReportedRecentlyError(body.retryAfterSeconds ?? 0);
      }

      // 배포가 겹치는 짧은 동안 옛 서버가 코드 없이 409만 줄 수 있습니다.
      // 호출부(useReport)가 이 메시지로 구분하므로 형태를 유지합니다.
      throw new Error('ALREADY_REPORTED', { cause: error });
    }
    throw error;
  }
};
