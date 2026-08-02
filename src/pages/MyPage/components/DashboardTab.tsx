/* src/pages/MyPage/components/DashboardTab.tsx */

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

  // 예전에는 isError를 받지 않아, 조회가 실패해도 로딩도 에러도 아닌 상태로
  // 화면을 그렸습니다. 이름과 가입일 자리가 빈 채로요. 실패했으면 실패했다고
  // 말하는 편이 빈 화면보다 낫습니다.
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
        {/* 이니셜은 저장하지 않고 여기서 계산합니다. 예전에는 가입 시점의
            닉네임이 박힌 이미지 URL을 저장해서, 닉네임을 바꿔도 옛 이름이
            계속 보였습니다. 디스코드 프로필 사진은 그대로 씁니다. */}
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
            {/* createdAt은 ISO 문자열이므로 Date 객체로 감싸서 변환 */}
            가입일:{' '}
            {profile.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : '알 수 없음'}
          </p>
        </div>
      </div>

      {/* 연동 배너 */}
      <div className="border-border-main bg-bg-main flex items-center justify-between rounded-xl border px-5 py-4">
        <span className="text-text-muted font-bold">블리자드 연동 계정</span>
        {profile.battletag ? (
          <div className="flex items-center gap-3">
            <span className="text-primary font-black">{profile.battletag}</span>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500">
              <span aria-hidden="true">✅</span>&nbsp;연동됨
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
