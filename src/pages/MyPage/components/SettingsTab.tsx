// src/pages/MyPage/components/SettingsTab.tsx

import { useState } from 'react';
import { cn } from '@/utils';
import { useUser, useMyReportsQuery, useDeleteAccountMutation } from '@/hooks';
import { useSettingsForm } from '../hooks';
import { DeleteAccountModal } from './DeleteAccountModal';

export const SettingsTab = ({
  onNavigateDashboard,
}: {
  onNavigateDashboard: () => void;
}) => {
  const { data: profile, isLoading } = useUser();
  const { data: myReports } = useMyReportsQuery();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const {
    mutate: deleteAccount,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteAccountMutation();

  if (isLoading || !profile) {
    return (
      <div className="text-text-muted py-20 text-center">
        설정 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <>
      <SettingsForm
        initialProfile={profile}
        onNavigateDashboard={onNavigateDashboard}
      />

      {/* 위험 구역. 저장 버튼과 붙여두면 오조작 위험이 있어 선으로 구분합니다. */}
      <div className="border-border-main mx-auto mt-10 max-w-112.5 border-t pt-6">
        <p className="mb-1.5 text-sm font-bold text-[#ff4757]">회원 탈퇴</p>
        <p className="text-text-muted mb-4 text-xs leading-relaxed">
          계정과 프로필이 삭제되며 되돌릴 수 없습니다. 작성하신 신고는 익명으로
          남습니다.
        </p>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className={cn(
            'rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-[#ff4757] transition-all',
            'hover:bg-red-500 hover:text-white',
          )}
        >
          회원 탈퇴
        </button>
      </div>

      {/* key가 바뀌면 리마운트되어 입력값이 초기화됩니다.
          effect로 비우면 렌더 중 setState가 되어 연쇄 렌더를 유발합니다. */}
      <DeleteAccountModal
        key={String(isDeleteOpen)}
        isOpen={isDeleteOpen}
        username={profile.username}
        reportCount={myReports?.length ?? 0}
        isPending={isDeleting}
        error={
          deleteError
            ? '탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.'
            : ''
        }
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteAccount()}
      />
    </>
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
