import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';

/** 404·렌더 에러·로그인 필요·권한 없음 공용 화면. 버튼은 상황마다 달라 호출부가 넘긴다. */

const ACTION_BASE =
  'inline-flex h-11 items-center rounded-lg px-6 text-sm font-bold transition-all active:scale-[0.97]';

const ACTION_VARIANT = {
  primary: 'bg-primary hover:bg-primary-hover text-bg-main',
  secondary: cn(
    'border-border-strong text-text-main border',
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

export const ErrorAction = ({
  to,
  onClick,
  variant = 'primary',
  children,
}: ActionProps) => {
  const className = cn(ACTION_BASE, ACTION_VARIANT[variant]);

  // 이동은 Link라야 새로고침 없이 넘어가고 새 탭도 된다
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
  /** 우리 쪽이 터졌을 때만 빨갛게 */
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
  <div className="mx-auto flex w-full max-w-300 grow flex-col justify-center px-5 pb-24 sm:px-10">
    {label && (
      <p
        className={cn(
          'font-display mb-2 text-6xl leading-none font-bold tracking-[0.04em] sm:text-8xl',
          tone === 'danger' ? 'text-danger' : 'text-primary',
        )}
      >
        {label}
      </p>
    )}

    <h1 className="text-text-main mt-2 text-[1.75rem] leading-[1.25] font-extrabold tracking-tight break-keep sm:text-4xl">
      {title}
    </h1>

    {description && (
      <p className="text-text-muted mt-3 max-w-140 text-base leading-relaxed break-keep">
        {description}
      </p>
    )}

    {children}

    <div className="mt-8 flex flex-wrap gap-3">
      {actions ?? <ErrorAction to="/">홈으로</ErrorAction>}
    </div>
  </div>
);
