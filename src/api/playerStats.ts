/* src/api/playerStats.ts */

import { api } from './axios';
import { InvalidPlayerStatsError } from '@/utils';
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

  // 타입 단언은 컴파일 시점에만 유효합니다. 런타임에 서버가 무엇을 돌려주든
  // 여기서 걸러야, 화면이 profile을 있다고 믿고 읽다가 TypeError로 죽는 대신
  // 정상적인 에러 상태(다시 시도 버튼 포함)가 됩니다.
  if (!data || typeof data !== 'object' || !data.profile) {
    throw new InvalidPlayerStatsError();
  }

  return data;
};

/**
 * 배틀태그가 오버워치에 실제로 있는지 확인합니다.
 *
 * **`null`은 "확인하지 못했다"입니다.** 상류 장애·타임아웃·쓰로틀이 여기로 옵니다.
 * `false`("확실히 없다")와 반드시 갈라야 합니다 — 서버가 죽었다고 가입을 막으면
 * 안 되기 때문입니다. 호출부는 `null`을 통과로 다룹니다.
 */
export const verifyBattletag = async (
  battletag: string,
): Promise<boolean | null> => {
  try {
    const { data } = await api.post<{ exists: boolean }>(
      '/api/stats/verify',
      { battletag },
      // 상류가 8초를 쓰고 실측 3~6초가 나옵니다. 공용 10초로는 우리가 먼저 끊습니다.
      { timeout: 15_000 },
    );

    // 200인데 모양이 다르면 판단 근거가 없습니다. 막지 말고 통과시킵니다.
    return typeof data?.exists === 'boolean' ? data.exists : null;
  } catch {
    return null;
  }
};
