import { CircleCheck } from 'lucide-react';
import { useUser } from '@/hooks';
import { Avatar } from '@/components';
import { PlayerStatsPanel } from './PlayerStatsPanel';

interface Props {
  onNavigateSettings: () => void;
}

export const DashboardTab = ({ onNavigateSettings }: Props) => {
  const { data: profile, isLoading, isError, refetch } = useUser();

  if (isLoading)
    return (
      <div className="text-text-muted py-20 text-center">
        프로필 불러오는 중...
      </div>
    );

  if (isError || !profile)
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-text-muted text-sm">프로필을 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="border-border-main text-text-muted hover:border-primary hover:text-primary rounded-lg border px-4 py-2 text-[13px] font-bold transition-colors"
        >
          다시 시도
        </button>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="border-border-main flex items-center gap-6 border-b pb-8">
        <Avatar
          photoUrl={profile.photoUrl}
          username={profile.username}
          uid={profile.uid}
          className="border-primary h-20 w-20 border-2 text-2xl shadow-lg"
        />
        <div>
          <h2 className="text-text-main text-2xl font-black">
            {profile.username}
          </h2>
          <p className="text-text-muted text-sm">
            가입일:{' '}
            {profile.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : '알 수 없음'}
          </p>
        </div>
      </div>

      <div className="border-border-main bg-bg-main flex items-center justify-between rounded-xl border px-5 py-4">
        <span className="text-text-muted font-bold">블리자드 연동 계정</span>
        {profile.battletag ? (
          <div className="flex items-center gap-3">
            <span className="text-primary font-black">{profile.battletag}</span>
            <span className="text-success bg-success/10 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold">
              <CircleCheck className="shrink-0" size={13} aria-hidden="true" />
              연동됨
            </span>
          </div>
        ) : (
          <span className="text-text-muted">연동된 계정이 없습니다.</span>
        )}
      </div>

      {/* 배틀태그가 없어도 그린다. 안내는 패널이 하고 요청은 훅이 막는다 */}
      <PlayerStatsPanel onNavigateSettings={onNavigateSettings} />
    </div>
  );
};
