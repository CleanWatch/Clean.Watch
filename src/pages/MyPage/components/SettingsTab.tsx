// src/pages/MyPage/components/SettingsTab.tsx

import { cn } from '@/utils';
import { useUser } from '@/hooks';
import { useSettingsForm } from '../hooks';

export const SettingsTab = ({
  onNavigateDashboard,
}: {
  onNavigateDashboard: () => void;
}) => {
  const { data: profile, isLoading } = useUser();

  if (isLoading || !profile) {
    return (
      <div className="text-text-muted py-20 text-center">
        설정 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <SettingsForm
      initialProfile={profile}
      onNavigateDashboard={onNavigateDashboard}
    />
  );
};

interface SettingsFormProps {
  initialProfile: {
    username: string;
    battletag?: string | null;
  };
  onNavigateDashboard: () => void;
}

const SettingsForm = ({
  initialProfile,
  onNavigateDashboard,
}: SettingsFormProps) => {
  // 💡 길고 복잡했던 상태 관리와 로직을 훅 하나로 깔끔하게 호출!
  const {
    username,
    battletag,
    usernameError,
    battletagError,
    isPending,
    isChecking,
    hasChanges,
    setUsername,
    setBattletag,
    setUsernameError,
    setBattletagError,
    handleSave,
  } = useSettingsForm({
    initialProfile,
    onSuccess: onNavigateDashboard,
  });

  return (
    <form
      onSubmit={handleSave}
      className="mx-auto flex max-w-112.5 flex-col gap-5"
    >
      <div>
        <label
          htmlFor="settings-username"
          className="text-text-muted mb-2 block text-sm font-bold"
        >
          유저네임
        </label>
        <input
          id="settings-username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (usernameError) setUsernameError('');
          }}
          className={cn(
            'bg-bg-input text-text-main w-full rounded-lg border p-4 transition-colors outline-none',
            usernameError
              ? 'border-red-500 focus:border-red-500'
              : 'border-border-main focus:border-primary',
          )}
        />
        {usernameError && (
          <p className="mt-2 text-xs font-bold text-red-500">
            {' '}
            {usernameError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="settings-battletag"
          className="text-text-muted mb-2 block text-sm font-bold"
        >
          오버워치 배틀태그
        </label>
        <input
          id="settings-battletag"
          type="text"
          value={battletag}
          onChange={(e) => {
            setBattletag(e.target.value);
            if (battletagError) setBattletagError('');
          }}
          placeholder="예) Justice#1234"
          className={cn(
            'bg-bg-input text-text-main w-full rounded-lg border p-4 transition-colors outline-none',
            battletagError
              ? 'border-red-500 focus:border-red-500'
              : 'border-border-main focus:border-primary',
          )}
        />
        {battletagError && (
          <p className="mt-2 text-xs font-bold text-red-500">
            {' '}
            {battletagError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!hasChanges || isPending || isChecking}
        className="bg-primary mt-4 rounded-lg py-4 font-bold text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
      >
        {isPending || isChecking ? '저장 중...' : '변경사항 저장'}
      </button>
    </form>
  );
};
