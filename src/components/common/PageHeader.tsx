import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface PageHeaderProps {
  /** 제목 위 작은 라벨. 화면 성격을 한 단어로. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}

/** 홈 이외 화면의 공용 머리말. 왼쪽 정렬, 카드 없이 바탕 위에 바로 놓는다. */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  className,
}: PageHeaderProps) => (
  <header className={cn('pt-12 pb-8 sm:pt-20 sm:pb-12', className)}>
    {eyebrow && (
      <p className="text-primary mb-4 text-[13px] font-bold tracking-[0.08em] sm:text-sm">
        {eyebrow}
      </p>
    )}
    <h1 className="text-text-main text-[2rem] leading-[1.2] font-extrabold tracking-tight break-keep sm:text-5xl">
      {title}
    </h1>
    {description && (
      <p className="text-text-muted mt-4 max-w-140 text-base leading-relaxed break-keep sm:text-lg">
        {description}
      </p>
    )}
  </header>
);
