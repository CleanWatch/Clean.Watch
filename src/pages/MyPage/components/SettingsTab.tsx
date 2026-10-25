import { useState } from 'react';
import { BATTLETAG_EXAMPLE, cn } from '@/utils';
import { useUser, useMyReportsQuery, useDeleteAccountMutation } from '@/hooks';
import { useSettingsForm } from '../hooks';
import { InputGroup } from '@/components';
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
      <div className="text-text-muted py-12">설정 정보를 불러오는 중...</div>
    );
  }

  return (
    <>
      <SettingsForm
        initialProfile={profile}
        onNavigateDashboard={onNavigateDashboard}
      />

      {/* 저장 버튼과 붙어 있으면 오조작하기 쉬워 선으로 떼어 둔다 */}
      <div className="border-border-main mt-10 max-w-110 border-t pt-6">
        <p className="text-danger mb-1.5 text-sm font-bold">회원 탈퇴</p>
        <p className="text-text-muted mb-4 text-xs leading-relaxed">
          계정과 프로필이 삭제되며 되돌릴 수 없습니다. 작성하신 신고는 익명으로
          남습니다.
        </p>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className={cn(
            'text-danger border-danger/30 bg-danger/10 inline-flex h-11 items-center rounded-lg border px-5 text-sm font-bold transition-all',
            'hover:bg-danger hover:text-bg-main',
          )}
        >
          회원 탈퇴
        </button>
      </div>

      {/* key로 리마운트해 입력값을 비운다. effect로 비우면 연쇄 렌더가 생긴다 */}
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
  const {
    username,
    battletag,
    usernameError,
    battletagError,
    isPending,
    isChecking,
    isVerifying,
    battletagWarning,
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
    <form onSubmit={handleSave} className="flex max-w-110 flex-col gap-5">
      <InputGroup
        label="유저네임"
        value={username}
        onChange={(val) => {
          setUsername(val);
          if (usernameError) setUsernameError('');
        }}
        error={usernameError}
      />

      <InputGroup
        label="오버워치 배틀태그"
        placeholder={BATTLETAG_EXAMPLE}
        value={battletag}
        onChange={(val) => {
          setBattletag(val);
          if (battletagError) setBattletagError('');
        }}
        error={battletagError}
        warning={battletagWarning}
      />

      <button
        type="submit"
        disabled={!hasChanges || isPending || isChecking || isVerifying}
        className="bg-primary hover:bg-primary-hover text-bg-main mt-4 rounded-lg py-4 font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50"
      >
        {/* 실존 확인에 몇 초 걸려 문구로 진행 중임을 알린다 */}
        {isVerifying
          ? '배틀태그 확인 중...'
          : isPending || isChecking
            ? '저장 중...'
            : battletagWarning
              ? '확인 없이 저장'
              : '변경사항 저장'}
      </button>
    </form>
  );
};
