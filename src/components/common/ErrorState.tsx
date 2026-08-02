/* src/components/common/ErrorState.tsx */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';

/**
 * 진행할 수 없을 때 그 자리를 대신 채우는 화면.
 *
 * 404, 렌더 에러, 로그인 필요, 권한 없음이 전부 같은 모양을 씁니다. 원래는
 * Admin과 MyPage 안에 각각 박혀 있어서 새 화면을 만들 때마다 다시 짜야 했습니다.
 *
 * 화면마다 다른 것은 문구와 버튼뿐입니다. 무엇을 눌러야 하는지가 상황마다
 * 다르므로(홈으로 / 다시 시도 / 로그인) 버튼은 호출부가 넘깁니다.
 */

const ACTION_BASE = 'rounded-lg px-6 py-2.5 text-sm font-bold transition-all';

const ACTION_VARIANT = {
  primary: 'bg-primary hover:bg-primary-hover text-white',
  secondary: cn(
    'border-border-main text-text-muted border',
    'hover:border-primary hover:text-primary',
  ),
} as const;

interface ActionProps {
  /** 이동이면 to, 동작이면 onClick. 둘 중 하나만 씁니다. */
  to?: string;
  onClick?: () => void;
  variant?: keyof typeof ACTION_VARIANT;
  children: ReactNode;
}

/** ErrorState의 버튼. 크기·여백은 화면마다 같고 배색만 갈립니다. */
export const ErrorAction = ({
  to,
  onClick,
  variant = 'primary',
  children,
}: ActionProps) => {
  const className = cn(ACTION_BASE, ACTION_VARIANT[variant]);

  // 이동은 Link라야 새로고침 없이 넘어가고, 우클릭·새 탭도 동작합니다.
  return to ? (
    <Link to={to} className={className}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
};

interface Props {
  /** 위쪽 작은 라벨. `404`, `오류`처럼 화면 성격을 한 단어로. */
  label?: string;
  /** 라벨을 빨갛게 할지. 우리 쪽이 터진 경우에만 씁니다. */
  tone?: 'muted' | 'danger';
  title: string;
  description?: ReactNode;
  /** 버튼 자리. 비우면 "홈으로" 하나가 들어갑니다. */
  actions?: ReactNode;
  /** 에러 원문 등 본문 아래 덧붙일 것. */
  children?: ReactNode;
}

export const ErrorState = ({
  label,
  tone = 'muted',
  title,
  description,
  actions,
  children,
}: Props) => (
  <div className="flex min-h-[calc(100dvh-160px)] flex-col items-center justify-center gap-1.5 px-5 text-center">
    {label && (
      <p
        className={cn(
          'text-xs font-bold tracking-[0.16em]',
          tone === 'danger' ? 'text-danger' : 'text-text-muted',
        )}
      >
        {label}
      </p>
    )}

    <h1 className="text-text-main mt-1 text-xl font-bold">{title}</h1>

    {description && (
      <p className="text-text-muted text-sm leading-relaxed">{description}</p>
    )}

    {children}

    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {actions ?? <ErrorAction to="/">홈으로</ErrorAction>}
    </div>
  </div>
);
