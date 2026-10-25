import { useState } from 'react';
import { cn } from '@/utils';

// 흰 글자가 올라가서 너무 밝은 색은 뺐다
const PALETTE = [
  '#ff8800',
  '#5865f2',
  '#22c55e',
  '#ef4444',
  '#a855f7',
  '#06b6d4',
] as const;

// 닉네임이 아니라 uid를 씨앗으로 쓴다. 닉네임을 바꿔도 색이 유지된다.
const colorOf = (seed: string): string => {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
};

/**
 * 예전에 저장하던 이니셜 이미지 URL인지. 옛 닉네임이 박혀 있어 무시한다.
 * 호스트명으로 정확히 판별한다. 넓게 잡으면 디스코드 사진까지 이니셜로 바뀐다.
 */
const isGeneratedInitials = (url: string): boolean => {
  try {
    return new URL(url).hostname === 'ui-avatars.com';
  } catch {
    return true;
  }
};

interface Props {
  /** 없거나 옛 이니셜 URL이면 무시 */
  photoUrl?: string | null;
  username?: string | null;
  /** 색 씨앗. 없으면 닉네임 */
  uid?: string | null;
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
        // 남의 CDN이라 404가 나면 이니셜로 넘어간다
        onError={() => setLoadFailed(true)}
        className={cn('rounded-full object-cover', className)}
      />
    );
  }

  // 코드포인트 단위로 잘라야 이모지가 반쪽 나지 않는다
  const initials = Array.from(username?.trim() || '?')
    .slice(0, 2)
    .join('');

  return (
    <div
      // 런타임 값이라 Tailwind 클래스로 못 만든다
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
