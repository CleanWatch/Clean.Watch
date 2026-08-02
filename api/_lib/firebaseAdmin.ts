/* src/lib/firebaseAdmin.ts */

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

// 환경 변수 안전성 검증 (TypeScript 타입 단언 방어)
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    '[Firebase Admin] 필수 환경 변수가 누락됨. (.env 확인 필요)',
  );
}

/**
 * Singleton 패턴: Vercel 서버리스 환경에서 중복 초기화로 인한 에러 및 과금 방지.
 *
 * getAdminAuth와 getAdminFirestore 양쪽이 이 함수를 거칩니다.
 * 예전에는 초기화가 getAdminAuth 안에만 있어서, Firestore만 쓰는 경로나
 * Auth 호출 전에 예외가 나는 경로에서 "default Firebase app does not exist"로
 * 터졌습니다. 호출 순서에 의존하지 않도록 여기로 모았습니다.
 */
function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const initialized = initializeApp({
    credential: cert({
      projectId: projectId,
      clientEmail: clientEmail,
      // Vercel 환경 변수에 등록된 문자열 형태의 줄바꿈(\\n)을 실제 이스케이프 개행(\n)으로 변환
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
