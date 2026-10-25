/// <reference types="node" />
import {
  initializeApp,
  cert,
  getApps,
  getApp,
  type App,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('[Firebase Admin] 필수 환경 변수가 누락됨. (.env 확인 필요)');
}

// 서버리스 인스턴스 재사용 시 중복 초기화를 막는다.
// Auth·Firestore 둘 다 여기를 거쳐야 호출 순서와 무관하게 초기화된다.
function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const initialized = initializeApp({
    credential: cert({
      projectId: projectId,
      clientEmail: clientEmail,
      // Vercel 환경 변수에는 개행이 \\n 문자열로 들어 있다
      privateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : '',
    }),
  });
  console.log('[Firebase Admin] 초기화 완료 및 격리 활성화');
  return initialized;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}
