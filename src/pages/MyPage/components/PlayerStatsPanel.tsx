/* src/pages/MyPage/components/PlayerStatsPanel.tsx */

import type { ReactNode } from 'react';
import { cn, getPlayerStatsError } from '@/utils';
import { useMyPlayerSummary, useUser } from '@/hooks';
import type { PlayerRankEntry, PlayerRole } from '@/types';

const ROLE_LABEL: Record<PlayerRole, string> = {
  tank: '탱커',
  damage: '딜러',
  support: '지원가',
  open: '자유 경쟁전',
};

const CARD =
  'border-border-main bg-bg-card rounded-xl border overflow-hidden' as const;

interface Props {
  onNavigateSettings: () => void;
}

/**
 * 티어 한 칸.
 *
 * 아이콘 URL은 전부 nullable입니다. src에 null을 넣으면 깨진 이미지가 뜨고,
 * 빈 컨테이너를 남겨두면 아이콘 없는 칸에 빈 줄이 생깁니다. 둘 다 있을 때만 그립니다.
 */
const RankTile = ({ entry }: { entry: PlayerRankEntry }) => {
  const hasIcon = !!(entry.roleIcon || entry.rankIcon);

  return (
    <div className="bg-bg-input flex flex-col items-center gap-1.5 rounded-lg p-3">
      <span className="text-text-muted text-[11px]">
        {ROLE_LABEL[entry.role]}
      </span>
      {hasIcon && (
        <div className="flex h-7 items-center gap-1">
          {entry.roleIcon && (
            <img src={entry.roleIcon} alt="" className="h-5 w-5" />
          )}
          {entry.rankIcon && (
            <img src={entry.rankIcon} alt="" className="h-7 w-7" />
          )}
        </div>
      )}
      <span className="text-text-main text-[13px] font-bold">
        {entry.division.toUpperCase()} {entry.tier}
      </span>
    </div>
  );
};

/** 문구 하나와 버튼 하나짜리 상태. 안내와 에러가 같은 껍데기를 씁니다. */
const Notice = ({
  message,
  children,
}: {
  message: string;
  children?: ReactNode;
}) => (
  <div className={cn(CARD, 'flex flex-col items-center gap-4 px-6 py-8')}>
    <p className="text-text-muted max-w-md text-center text-sm leading-relaxed">
      {message}
    </p>
    {children}
  </div>
);

export const PlayerStatsPanel = ({ onNavigateSettings }: Props) => {
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data, isLoading, isFetching, error, refetch } = useMyPlayerSummary();

  const settingsButton = (
    <button
      type="button"
      onClick={onNavigateSettings}
      className="bg-primary hover:bg-primary-hover rounded-lg px-4 py-2 text-[13px] font-bold text-white transition-colors"
    >
      프로필 설정으로
    </button>
  );

  if (isUserLoading) {
    return (
      <div className={cn(CARD, 'text-text-muted py-10 text-center text-sm')}>
        전적 불러오는 중...
      </div>
    );
  }

  // 배틀태그가 없으면 화면에서 바로 안내합니다.
  //
  // 서버도 BATTLETAG_NOT_SET을 돌려주지만 그 코드는 여기 도달하지 않습니다.
  // 훅이 enabled: false로 요청 자체를 막기 때문입니다(호출 한 번과 Firestore
  // 읽기 한 번을 아끼려고 일부러 그렇게 뒀습니다). 서버 코드에만 의존하면
  // 요청이 없으니 에러도 없고, 결국 아무것도 그리지 않게 됩니다.
  if (!user?.battletag) {
    return (
      <Notice message="배틀태그를 등록하면 전적을 볼 수 있어요.">
        {settingsButton}
      </Notice>
    );
  }

  if (isLoading) {
    return (
      <div className={cn(CARD, 'text-text-muted py-10 text-center text-sm')}>
        전적 불러오는 중...
      </div>
    );
  }

  if (error) {
    const info = getPlayerStatsError(error);

    return (
      <Notice message={info?.message ?? '전적을 불러오지 못했습니다.'}>
        {info?.action === 'settings' && settingsButton}

        {/* 갱신 버튼은 여기에만 둡니다. 정상 상태에서 눌러도 상류가 1시간
            캐시라 같은 값이 와서, "갱신"이라 써놓고 안 바뀌면 거짓말이 됩니다. */}
        {info?.action === 'retry' && (
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-border-main text-text-muted hover:border-primary hover:text-primary rounded-lg border px-4 py-2 text-[13px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? '불러오는 중...' : '다시 시도'}
          </button>
        )}
      </Notice>
    );
  }

  if (!data) return null;

  const { profile, rank } = data;

  return (
    <div className={CARD}>
      {/* 배경에 profile.namecard를 깔 수도 있지만 쓰지 않습니다. 밝은 네임카드에서는
          오버레이를 씌워도 오른쪽 글자가 묻히고, 오버레이를 진하게 하면 이미지가
          안 보여 얻는 게 없습니다. 응답에는 남아 있으니 필요해지면 꺼내 쓰세요. */}
      <div className="border-border-main flex items-center gap-3.5 border-b p-4">
        {profile.avatar && (
          <img
            src={profile.avatar}
            alt=""
            className="border-border-main h-13 w-13 shrink-0 rounded-lg border"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-text-main truncate font-bold">
              {profile.username}
            </span>
            {profile.endorsementLevel !== null && (
              <span
                className="border-border-main text-text-muted flex shrink-0 items-center gap-1 rounded-full border py-0.5 pr-2 pl-1 text-[11px]"
                title={`추천 레벨 ${profile.endorsementLevel}`}
              >
                {/* 아이콘 URL은 레벨별로 다른 SVG입니다. 없을 수도 있어
                    조건부로 그리고, 없으면 숫자만 남습니다. */}
                {profile.endorsementIcon && (
                  <img
                    src={profile.endorsementIcon}
                    alt=""
                    className="h-4 w-4"
                  />
                )}
                추천 {profile.endorsementLevel}
              </span>
            )}
          </div>
          {profile.title && (
            <p className="text-text-muted mt-0.5 truncate text-xs">
              {profile.title}
            </p>
          )}
        </div>

        {rank?.season !== null && rank?.season !== undefined && (
          <span className="text-primary bg-primary/10 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold">
            시즌 {rank.season}
          </span>
        )}
      </div>

      {rank ? (
        // 서버가 기록 없는 역할군을 이미 걸러서 보냅니다. 개수가 1~4개로
        // 가변이라 칸 수를 고정하면 빈 칸이 생기거나 넘칩니다.
        <div className="grid grid-cols-[repeat(auto-fit,minmax(90px,1fr))] gap-2.5 p-4">
          {rank.entries.map((entry) => (
            <RankTile key={entry.role} entry={entry} />
          ))}
        </div>
      ) : (
        // 실패가 아닙니다. 프로필은 멀쩡히 있고 경쟁전 기록만 없는 상태입니다.
        <div className="p-4">
          <div className="bg-bg-input rounded-lg px-4 py-5 text-center">
            <p className="text-text-muted text-sm">
              경쟁전 기록이 없거나 비공개 프로필입니다.
            </p>
            {/* 커리어 공개 설정은 게임 안에 있습니다. 웹사이트로 안내하면
                그 설정이 없는 곳으로 보내는 셈입니다. */}
            <p className="text-text-muted/70 mt-2 text-xs leading-relaxed">
              공개 설정은 게임 안 옵션 → 소셜에서 바꿀 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {profile.lastUpdatedAt && (
        <div className="border-border-main text-text-muted/70 border-t px-4 py-2.5 text-[11px]">
          {new Date(profile.lastUpdatedAt).toLocaleString()} 기준
        </div>
      )}
    </div>
  );
};
