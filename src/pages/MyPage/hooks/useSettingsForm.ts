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

  // 화면에서 경고 해제를 빠뜨리지 않게 setter를 감싼다
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

    // 형식 검사가 먼저. 틀린 값으로 중복 검사 요청을 보낼 이유가 없다.
    // 안내일 뿐 강제는 아니다 (규칙은 role·uid·createdAt만 막는다).
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

    // 바뀐 경우만 검사한다. 예전에 잘못 저장된 태그 때문에 닉네임 수정이 막히면 안 된다.
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
          setUsernameError('이미 사용 중인 닉네임입니다.');
          hasError = true;
        }
      }

      if (isBattletagChanged && battletag.trim()) {
        const isTagDuplicated = await validateDuplicate({
          field: 'battletag',
          value: battletag.trim(),
        });

        if (isTagDuplicated) {
          setBattletagError('이미 연동된 배틀태그입니다.');
          hasError = true;
        }
      }

      if (hasError) return;

      // 중복 검사 뒤에 둔다. 남이 쓰는 태그로 쓰로틀 할당량을 깎지 않게.
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
