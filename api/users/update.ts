import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { requireUid, toErrorResponse } from '../_lib/auth.js';
import { isValidBattletag } from '../_lib/overfast.js';
import { ProfileError, isTaken, isValidUsername } from '../_lib/userProfile.js';

/**
 * 닉네임·배틀태그 수정. 바뀐 값만 형식과 중복을 검사한다.
 * 예전에 저장된 값 때문에 다른 필드 수정이 막히면 안 된다.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const uid = await requireUid(req);

    const { username, battletag } = req.body ?? {};

    if (typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ error: 'USERNAME_INVALID' });
    }
    if (battletag != null && typeof battletag !== 'string') {
      return res.status(400).json({ error: 'BATTLETAG_INVALID' });
    }

    const name = username.trim();
    const tag = battletag?.trim() || null;

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(uid);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) throw new ProfileError(404, 'PROFILE_NOT_FOUND');

      const prev = snap.data();

      if (name !== prev?.username) {
        if (!isValidUsername(name)) {
          throw new ProfileError(400, 'USERNAME_INVALID');
        }
        if (await isTaken(db, tx, 'username', name, uid)) {
          throw new ProfileError(409, 'USERNAME_TAKEN');
        }
      }

      if (tag !== (prev?.battletag ?? null)) {
        if (tag) {
          if (!isValidBattletag(tag)) {
            throw new ProfileError(400, 'BATTLETAG_INVALID');
          }
          if (await isTaken(db, tx, 'battletag', tag, uid)) {
            throw new ProfileError(409, 'BATTLETAG_TAKEN');
          }
        }
      }

      tx.update(userRef, { username: name, battletag: tag });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof ProfileError) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error('[User Update Error]:', error);
    const { status, body } = toErrorResponse(error);
    return res.status(status).json(body);
  }
}
