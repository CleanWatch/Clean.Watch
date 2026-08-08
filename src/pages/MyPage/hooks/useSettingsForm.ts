/* src/pages/MyPage/hooks/useSettingsForm.ts */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  useUpdateProfileMutation,
  useCheckDuplicate,
  useBattletagVerification,
} from '@/hooks';
import {
  BATTLETAG_FORMAT_ERROR,
  BATTLETAG_NOT_FOUND_WARNING,
  getFieldError,
  isValidBattletag,
  isValidUsername,
} from '@/utils';

// 훅에서 넘겨받을 인자들 타입 정의
interface UseSettingsFormProps {
  initialProfile: {
    username: string;
    battletag?: string | null;
  };
  onSuccess: () => void;
}

export const useSettingsForm = ({
  initialProfile,
  onSuccess,
}: UseSettingsFormProps) => {
  const { mutate: updateProfile, isPending } = useUpdateProfileMutation();
  const { validateDuplicate, isChecking } = useCheckDuplicate();
  const {
    isVerifying,
    isWarning: isBattletagWarning,
    shouldProceed,
    clearWarning,
  } = useBattletagVerification();

  const [username, setUsername] = useState(initialProfile.username || '');
  const [battletag, setBattletag] = useState(initialProfile.battletag || '');
  const [usernameError, setUsernameError] = useState('');
  const [battletagError, setBattletagError] = useState('');

  /**
   * 배틀태그를 고치면 앞선 경고는 그 값에 대한 것이 아닙니다.
   * `setBattletag`을 그대로 내보내면 화면 쪽에서 이 처리를 빠뜨릴 수 있어 여기서 감쌉니다.
   */
  const changeBattletag = (value: string) => {
    setBattletag(value);
    clearWarning();
  };

  const isUsernameChanged = username !== initialProfile.username;
  const isBattletagChanged = battletag !== (initialProfile.battletag || '');
  const hasChanges = isUsernameChanged || isBattletagChanged;

  const handleSave = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!hasChanges) return;

    setUsernameError('');
    setBattletagError('');
    let hasError = false;

    // 형식 검사를 중복 검사보다 먼저 합니다.
    //
    // 이 화면에는 형식 검사가 아예 없어서, 가입 때는 막히는 값(zzz, 한 글자 닉네임)이
    // 여기서는 그대로 저장됐습니다. 같은 규칙인데 화면마다 다르게 적용되던 상태입니다.
    //
    // 앞에 두는 이유: 형식이 틀린 값은 어차피 저장 못 하므로 중복 검사 요청조차
    // 보낼 이유가 없습니다.
    //
    // 참고: 이건 강제가 아니라 안내입니다. firestore.rules의 users update 규칙은
    // role·uid·createdAt만 막으므로 개발자도구로는 여전히 아무 값이나 쓸 수 있습니다.
    if (isUsernameChanged) {
      const message = getFieldError(
        username.trim(),
        '닉네임을 입력해 주세요.',
        isValidUsername,
        '닉네임은 특수문자를 제외한 2~12자여야 합니다.',
      );
      if (message) {
        setUsernameError(message);
        hasError = true;
      }
    }

    // 배틀태그는 비우는 것이 정상 동작(연동 해제)이라 emptyMsg를 null로 둡니다.
    // isBattletagChanged가 false면 검사하지 않습니다 — 과거에 잘못 저장된 값을 가진
    // 사람이 닉네임만 고치려는데 막히면 안 됩니다.
    if (isBattletagChanged) {
      const message = getFieldError(
        battletag.trim(),
        null,
        isValidBattletag,
        BATTLETAG_FORMAT_ERROR,
      );
      if (message) {
        setBattletagError(message);
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      if (isUsernameChanged) {
        const isNameDuplicated = await validateDuplicate({
          field: 'username',
          value: username.trim(),
        });

        if (isNameDuplicated) {
          setUsernameError('이미 사용 중인 닉네임입니다 😭');
          hasError = true;
        }
      }

      if (isBattletagChanged && battletag.trim()) {
        const isTagDuplicated = await validateDuplicate({
          field: 'battletag',
          value: battletag.trim(),
        });

        if (isTagDuplicated) {
          setBattletagError('이미 연동된 배틀태그입니다 😭');
          hasError = true;
        }
      }

      if (hasError) return;

      // 실존 확인은 중복 검사 뒤에 둡니다. 이미 남이 쓰는 태그면 상류에 물어볼
      // 이유가 없고, 쓰로틀 할당량만 깎입니다.
      // 배틀태그를 안 건드린 저장(닉네임만 수정)에서는 확인하지 않습니다.
      if (isBattletagChanged && !(await shouldProceed(battletag))) return;

      updateProfile(
        { username: username.trim(), battletag: battletag.trim() },
        {
          onSuccess: () => {
            clearWarning();
            onSuccess();
          },
        },
      );
    } catch (error) {
      console.error('중복 검사 중 오류 발생:', error);
      toast.error('서버와 통신 중 문제가 발생했습니다', {
        description: '잠시 후 다시 시도해 주세요.',
      });
    }
  };

  // 컴포넌트(UI)에서 쓸 수 있도록 필요한 것들만 밖으로 내보내기
  return {
    username,
    battletag,
    usernameError,
    battletagError,
    isPending,
    isChecking,
    isVerifying,
    battletagWarning: isBattletagWarning ? BATTLETAG_NOT_FOUND_WARNING : '',
    hasChanges,
    setUsername,
    setBattletag: changeBattletag,
    setUsernameError,
    setBattletagError,
    handleSave,
  };
};
