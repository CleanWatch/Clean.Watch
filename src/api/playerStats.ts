/* src/api/playerStats.ts */

import { api } from './axios';
import type { MyPlayerSummary } from '@/types';

/**
 * 본인의 오버워치 프로필 요약.
 *
 * 파일 이름 주의: src/api/stats.ts는 홈 화면의 누적 신고 수를 세는 별개 파일입니다.
 *
 * 서버가 배틀태그를 ID 토큰에서 꺼내므로 인자가 없습니다. 자세한 이유는
 * api/stats/me.ts 주석 참고.
 */
export const fetchMyPlayerSummary = async (): Promise<MyPlayerSummary> => {
  // 이 호출만 제한 시간을 늘립니다. 공용 인스턴스는 10초인데 서버가 상류에
  // 8초를 쓰므로, 10초로는 서버가 UPSTREAM_TIMEOUT을 돌려주기도 전에
  // 클라이언트가 먼저 끊어버립니다. 그러면 상태 코드 없는 ECONNABORTED만 남아
  // 무엇 때문에 실패했는지 알 수 없습니다.
  const { data } = await api.get<MyPlayerSummary>('/api/stats/me', {
    timeout: 15_000,
  });

  return data;
};
