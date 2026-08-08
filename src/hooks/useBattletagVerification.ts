/* src/hooks/useBattletagVerification.ts */

import { useState } from 'react';
import { verifyBattletag } from '@/api';

/**
 * 저장 전에 배틀태그 실존을 확인하고, 못 찾으면 **한 번 경고한 뒤 통과**시킵니다.
 *
 * 막지 않는 이유 — 오버워치는 **비공개 프로필도 404**를 냅니다. 비공개는 흔한
 * 설정이라 거부하면 그 사람들은 자기 진짜 배틀태그를 아예 등록할 수 없습니다.
 *
 * 가입 화면과 프로필 설정이 같은 규칙을 각자 구현하면 어긋나므로(`getFieldError`가
 * 같은 이유로 공유되고 있습니다) 여기로 모읍니다.
 */
export const useBattletagVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  /**
   * 경고를 이미 띄운 배틀태그. **불리언이 아니라 값으로 들고 있는 이유** —
   * 경고를 본 뒤 사용자가 태그를 **다른 값으로 고치면 다시 확인해야** 합니다.
   * 불리언이면 두 번째 잘못된 태그가 확인 없이 저장됩니다.
   */
  const [warnedTag, setWarnedTag] = useState<string | null>(null);

  /**
   * 저장을 계속해도 되는지. `false`면 호출부가 멈추고 경고를 띄웁니다.
   *
   * 확인 실패(`null`)는 **통과**입니다. 상류가 죽었다고 저장을 막으면 사용자는
   * 자기가 뭘 잘못했는지 알 수 없는 채로 갇힙니다.
   */
  const shouldProceed = async (battletag: string): Promise<boolean> => {
    const tag = battletag.trim();

    // 비우는 것은 연동 해제입니다. 물어볼 상류가 없습니다.
    if (!tag) return true;

    // 같은 태그로 다시 눌렀다 = "확인 없이 저장"
    if (warnedTag === tag) return true;

    setIsVerifying(true);
    try {
      const exists = await verifyBattletag(tag);
      if (exists === false) {
        setWarnedTag(tag);
        return false;
      }
      return true;
    } finally {
      setIsVerifying(false);
    }
  };

  /** 경고 상태를 지웁니다. 저장에 성공했거나 화면을 떠날 때. */
  const clearWarning = () => setWarnedTag(null);

  return {
    isVerifying,
    /** 지금 경고가 떠 있는지. 버튼 문구를 "확인 없이 저장"으로 바꿀 때 씁니다. */
    isWarning: warnedTag !== null,
    shouldProceed,
    clearWarning,
  };
};
