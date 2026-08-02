/* src/components/common/Avatar.tsx */

import { useState } from 'react';
import { cn } from '@/utils';

/**
 * 이니셜 아바타 배경색 후보.
 *
 * 사이트 팔레트에서 서로 구분되는 색만 골랐습니다. 흰 글자가 올라가므로
 * 너무 밝은 색은 넣지 않습니다.
 */
const PALETTE = [
  '#ff8800',
  '#5865f2',
  '#22c55e',
  '#ef4444',
  '#a855f7',
  '#06b6d4',
] as const;

/**
 * 씨앗 문자열에서 항상 같은 색을 뽑습니다.
 *
 * 씨앗으로 uid를 씁니다. 닉네임을 쓰면 닉네임을 바꿀 때 아바타 색까지 바뀌어서
 * 같은 사람으로 안 보입니다. uid는 변하지 않습니다.
 */
const colorOf = (seed: string): string => {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
};

/**
 * 우리가 만들어 저장했던 이니셜 이미지인지 판별합니다.
 *
 * 가입 시점의 닉네임이 URL에 박혀 있어서, 닉네임을 바꿔도 옛 이름이 계속 보였습니다.
 * 이제 이니셜은 화면에서 계산하므로 이런 URL은 무시합니다.
 *
 * 호스트명으로 정확히 판별합니다. 넓게 잡으면 디스코드 프로필 사진까지
 * 삼켜서 진짜 사진이 이니셜로 바뀝니다 — 고치려던 것보다 나쁜 결과입니다.
 */
const isGeneratedInitials = (url: string): boolean => {
  try {
    return new URL(url).hostname === 'ui-avatars.com';
  } catch {
    // URL로 파싱조차 안 되면 이미지로 쓸 수 없으니 이니셜로 넘깁니다.
    return true;
  }
};

interface Props {
  /** 디스코드 프로필 사진 등. 없거나 우리가 만든 이니셜 URL이면 무시됩니다. */
  photoUrl?: string | null;
  username?: string | null;
  /** 색을 고르는 씨앗. 없으면 닉네임으로 대체합니다. */
  uid?: string | null;
  /** 크기·테두리·글자 크기는 호출부에서 정합니다. */
  className?: string;
}

export const Avatar = ({ photoUrl, username, uid, className }: Props) => {
  const [loadFailed, setLoadFailed] = useState(false);

  const usePhoto = !!photoUrl && !isGeneratedInitials(photoUrl) && !loadFailed;

  if (usePhoto) {
    return (
      <img
        src={photoUrl}
        alt=""
        // 남의 CDN이라 나중에 404가 날 수 있습니다. 깨진 이미지 아이콘 대신
        // 이니셜로 넘어가게 합니다.
        onError={() => setLoadFailed(true)}
        className={cn('rounded-full object-cover', className)}
      />
    );
  }

  // 코드포인트 단위로 자릅니다. slice(0, 2)를 문자열에 그대로 쓰면
  // 이모지가 반쪽으로 잘려 깨집니다.
  const initials = Array.from(username?.trim() || '?')
    .slice(0, 2)
    .join('');

  return (
    <div
      // 색은 실행 중에 계산되는 값이라 Tailwind 클래스로 만들 수 없습니다.
      // Tailwind는 빌드 시점에 소스를 훑어 클래스를 생성하므로 변수를 끼운
      // bg-[...] 는 CSS가 만들어지지 않습니다. 색만 인라인으로 둡니다.
      style={{ backgroundColor: colorOf(uid || username || '') }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none',
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};
