import axios from 'axios';
import { auth } from '@/firebase/firebase';

// 같은 도메인이라 baseURL 없이 상대 경로로 부른다.
// 회원탈퇴가 여러 단계를 순서대로 돌아서 10초는 필요하다.
export const api = axios.create({
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 로그인 상태면 ID 토큰을 붙인다. 가입·캡챠 검증은 토큰 없이 나간다.
api.interceptors.request.use(async (config) => {
  const idToken = await auth.currentUser?.getIdToken();
  if (idToken) config.headers.Authorization = `Bearer ${idToken}`;
  return config;
});
