import { api } from './axios';
import { InvalidPlayerStatsError } from '@/utils';
import type { MyPlayerSummary } from '@/types';

// 홈 통계(stats.ts)와는 별개. 배틀태그는 서버가 토큰으로 찾는다.
export const fetchMyPlayerSummary = async (): Promise<MyPlayerSummary> => {
  // 서버가 상류에 8초를 쓰므로 공용 10초보다 길게 잡아야 원인 코드를 받는다
  const { data } = await api.get<MyPlayerSummary>('/api/stats/me', {
    timeout: 15_000,
  });

  // 런타임 모양 검사. 없으면 화면이 profile을 읽다 TypeError로 죽는다.
  if (!data || typeof data !== 'object' || !data.profile) {
    throw new InvalidPlayerStatsError();
  }

  return data;
};

/**
 * 배틀태그 실존 확인.
 * null은 "확인 못 함"(상류 장애·쓰로틀)이라 false와 구분한다. 호출부는 null을 통과로 다룬다.
 */
export const verifyBattletag = async (
  battletag: string,
): Promise<boolean | null> => {
  try {
    const { data } = await api.post<{ exists: boolean }>(
      '/api/stats/verify',
      { battletag },
      { timeout: 15_000 },
    );

    return typeof data?.exists === 'boolean' ? data.exists : null;
  } catch {
    return null;
  }
};
