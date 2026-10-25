import { useState } from 'react';
import { verifyBattletag } from '@/api';

/**
 * 저장 전 배틀태그 실존 확인. 못 찾으면 한 번 경고하고, 다시 누르면 통과시킨다.
 * 비공개 프로필도 404라서 막으면 그 사람들은 진짜 태그를 등록할 수 없다.
 */
export const useBattletagVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  // 불리언이 아니라 값으로 든다. 경고 후 다른 태그로 고치면 다시 확인해야 한다.
  const [warnedTag, setWarnedTag] = useState<string | null>(null);

  // 확인 실패(null)는 통과. 상류 장애로 저장을 막지 않는다.
  const shouldProceed = async (battletag: string): Promise<boolean> => {
    const tag = battletag.trim();

    // 비우면 연동 해제
    if (!tag) return true;

    // 경고를 본 태그로 다시 누름 = 확인 없이 저장
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

  const clearWarning = () => setWarnedTag(null);

  return {
    isVerifying,
    isWarning: warnedTag !== null,
    shouldProceed,
    clearWarning,
  };
};
