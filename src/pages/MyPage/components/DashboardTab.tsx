/* src/pages/MyPage/components/DashboardTab.tsx */

import { useUser } from '@/hooks';
import { PlayerStatsPanel } from './PlayerStatsPanel';

interface Props {
  onNavigateSettings: () => void;
}

export const DashboardTab = ({ onNavigateSettings }: Props) => {
  const { data: profile, isLoading } = useUser(); // ✨ useMyProfileQuery -> useUser 교체

  if (isLoading)
    return (
      <div className="text-text-muted py-20 text-center">
        프로필 불러오는 중...
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="border-border-main flex items-center gap-6 border-b pb-8">
        <img
          src={profile?.photoUrl}
          alt="프로필"
          className="border-primary h-20 w-20 rounded-full border-2 shadow-lg"
        />
        <div>
          <h2 className="text-text-main text-2xl font-black">
            {profile?.username}
          </h2>
          <p className="text-text-muted text-sm">
            {/* createdAt은 ISO 문자열이므로 Date 객체로 감싸서 변환 */}
            가입일:{' '}
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : '알 수 없음'}
          </p>
        </div>
      </div>

      {/* 연동 배너 */}
      <div className="border-border-main bg-bg-input flex items-center justify-between rounded-xl border px-5 py-4">
        <span className="text-text-muted font-bold">블리자드 연동 계정</span>
        {profile?.battletag ? (
          <div className="flex items-center gap-3">
            <span className="text-primary font-black">{profile.battletag}</span>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500">
              ✅ 연동됨
            </span>
          </div>
        ) : (
          <span className="text-text-muted">연동된 계정이 없습니다.</span>
        )}
      </div>

      {/* 배틀태그가 없어도 그립니다. "등록하면 볼 수 있어요" 안내를 패널이
          담당하고, 훅의 enabled가 네트워크 호출 자체를 막습니다. */}
      <PlayerStatsPanel onNavigateSettings={onNavigateSettings} />
    </div>
  );
};
