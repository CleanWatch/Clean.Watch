import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { fetchMyPlayerSummary } from '@/api';
import { useUser } from './useUser';

export const myPlayerSummaryKey = (uid: string | null) => [
  'myPlayerSummary',
  uid,
];

// 서버가 no-store를 주므로 캐시는 여기 하나뿐이다
export const useMyPlayerSummary = () => {
  const uid = useAuthStore((state) => state.uid);
  const { data: profile } = useUser();

  return useQuery({
    queryKey: myPlayerSummaryKey(uid),
    queryFn: fetchMyPlayerSummary,

    // 배틀태그가 없으면 부르지 않는다. 서버의 400은 최후 방어선일 뿐이다.
    enabled: !!uid && !!profile?.battletag,

    // 상류가 1시간 캐시한다
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,

    // 404는 재시도로 안 고쳐지고, 타임아웃을 한 번 더 하면 15초 예산을 넘는다.
    // 대신 화면에 재시도 버튼을 둔다.
    retry: 0,
  });
};
