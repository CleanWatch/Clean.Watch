import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireUid, toErrorResponse } from '../_lib/auth.js';
import { isValidBattletag } from '../_lib/overfast.js';
import { ProfileError, isTaken, isValidUsername } from '../_lib/userProfile.js';

/**
 * 가입 직후 프로필 문서 생성.
 * role은 서버가 'user'로 고정하고, 이메일은 본문이 아니라 인증 계정에서 읽는다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const uid = await requireUid(req);

    const { username, battletag } = req.body ?? {};

    if (typeof username !== 'string' || !isValidUsername(username.trim())) {
      return res.status(400).json({ error: 'USERNAME_INVALID' });
    }
    if (battletag != null && typeof battletag !== 'string') {
      return res.status(400).json({ error: 'BATTLETAG_INVALID' });
    }

    const name = username.trim();
    const tag = battletag?.trim() || null;

    if (tag && !isValidBattletag(tag)) {
      return res.status(400).json({ error: 'BATTLETAG_INVALID' });
    }

    const { email } = await getAdminAuth().getUser(uid);

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(uid);

    await db.runTransaction(async (tx) => {
      // 이미 있으면 덮어쓰지 않는다. role이 바뀐 계정을 되돌릴 수 있다.
      if ((await tx.get(userRef)).exists) {
        throw new ProfileError(409, 'PROFILE_EXISTS');
      }
      if (await isTaken(db, tx, 'username', name, uid)) {
        throw new ProfileError(409, 'USERNAME_TAKEN');
      }
      if (tag && (await isTaken(db, tx, 'battletag', tag, uid))) {
        throw new ProfileError(409, 'BATTLETAG_TAKEN');
      }

      tx.set(userRef, {
        uid,
        email: email ?? '',
        username: name,
        battletag: tag,
        // 이니셜 아바타는 Avatar 컴포넌트가 현재 닉네임으로 그린다
        photoUrl: null,
        role: 'user',
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    if (error instanceof ProfileError) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error('[User Create Error]:', error);
    const { status, body } = toErrorResponse(error);
    return res.status(status).json(body);
  }
}
