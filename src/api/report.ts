import axios from 'axios';
import { api } from './axios';
import { AlreadyReportedRecentlyError } from '@/utils';

// 신고자 uid는 서버가 토큰에서 꺼낸다
export const submitNewReport = async (
  battletag: string,
  reason: string,
  details: string,
) => {
  try {
    await api.post('/api/reports/create', { battletag, reason, details });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      const body = error.response.data as
        { error?: string; retryAfterSeconds?: number } | undefined;

      if (body?.error === 'ALREADY_REPORTED_RECENTLY') {
        throw new AlreadyReportedRecentlyError(body.retryAfterSeconds ?? 0);
      }

      // 코드 없는 409 (배포 전환 중 옛 서버). useReport가 이 메시지로 구분한다.
      throw new Error('ALREADY_REPORTED', { cause: error });
    }
    throw error;
  }
};
