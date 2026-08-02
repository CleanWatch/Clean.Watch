/* src/hooks/queries/useMyPlayerSummary.ts */

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { fetchMyPlayerSummary } from '@/api';
import { useUser } from './useUser';

/** 배틀태그를 바꿨을 때 무효화할 수 있도록 키를 노출합니다. */
export const myPlayerSummaryKey = (uid: string | null) => [
  'myPlayerSummary',
  uid,
];

/**
 * 본인의 오버워치 프로필 요약.
 *
 * 캐시 주체는 여기 하나입니다. 서버가 Cache-Control: private, no-store를 주므로
 * 브라우저 HTTP 캐시가 끼어들지 않습니다. 둘이 겹치면 invalidateQueries가
 * 통하지 않고 로그아웃 뒤에도 남습니다.
 */
export const useMyPlayerSummary = () => {
  const uid = useAuthStore((state) => state.uid);
  const { data: profile } = useUser();

  return useQuery({
    queryKey: myPlayerSummaryKey(uid),
    queryFn: fetchMyPlayerSummary,

    // 배틀태그가 없으면 아예 부르지 않습니다. useUser가 이미 그 값을 갖고 있어
    // 서버까지 갔다 올 이유가 없습니다. 서버의 400은 최후의 방어선으로 남기고,
    // 발견 수단으로 쓰지 않습니다.
    enabled: !!uid && !!profile?.battletag,

    // 상류가 1시간 캐시하므로 자주 물어봐야 얻을 게 없습니다.
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,

    // 전역 기본값(main.tsx의 retry: 1)을 덮습니다.
    // 404는 재시도해도 안 고쳐지고, 8초 타임아웃을 한 번 더 하면
    // 클라이언트 예산(15초)을 넘겨 원인 없는 실패가 됩니다.
    // 대신 사용자가 직접 누르는 재시도 버튼을 제공합니다.
    retry: 0,
  });
};
