/* src/api/axios.ts */

import axios from 'axios';
import { auth } from '@/firebase/firebase';

/**
 * 우리 서버(api/) 전용 axios 인스턴스.
 *
 * baseURL은 두지 않습니다. 서버리스 함수가 프론트엔드와 같은 도메인에 있어
 * 상대 경로면 충분하고, 값이 비거나 잘못 들어가면 모든 호출이 엉뚱한 곳으로
 * 나가기만 합니다. 예전에는 VITE_API_BASE_URL을 읽었지만 그 변수는 어디에도
 * 설정되어 있지 않아 undefined였습니다.
 *
 * 타임아웃은 로그인 쪽 withTimeout과 같은 10초입니다. 회원탈퇴는 신고 익명화와
 * 계정 삭제를 순서대로 처리하므로 5초로는 정상 요청이 잘릴 수 있습니다.
 */
export const api = axios.create({
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청마다 Firebase ID 토큰을 자동으로 붙입니다.
 *
 * 예전에는 호출부 네 곳이 각자 getIdToken()을 부르고 헤더를 조립했습니다.
 * 새 엔드포인트를 추가하면서 빠뜨리면 서버는 401을 돌려주는데, 원인이
 * 호출부에 있다는 것은 응답에 드러나지 않습니다.
 *
 * 토큰이 없으면 헤더를 붙이지 않습니다. 회원가입과 캡챠 검증은 계정이
 * 생기기 전에 실행되므로 인증 없이도 통과해야 합니다.
 */
api.interceptors.request.use(async (config) => {
  const idToken = await auth.currentUser?.getIdToken();
  if (idToken) config.headers.Authorization = `Bearer ${idToken}`;
  return config;
});
