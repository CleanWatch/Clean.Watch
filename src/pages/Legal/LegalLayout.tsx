import { Link } from 'react-router-dom';
import { PageHeader } from '@/components';

// 약관·방침 공용 셸. 본문 요소는 elements.tsx (L로 묶어 쓴다).
export const LegalLayout = ({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) => (
  <div className="mx-auto w-full max-w-300 grow px-5 sm:px-10">
    <article className="text-text-main max-w-200 pb-16 sm:pb-24">
      <PageHeader
        eyebrow={`시행일 ${effectiveDate}`}
        title={title}
        className="border-border-main mb-8 border-b"
      />

      <div className="text-[15px] leading-relaxed">{children}</div>

      <footer className="border-border-main mt-10 border-t pt-6">
        <Link
          to="/"
          className="text-primary hover:text-primary-hover inline-flex min-h-11 items-center text-[14px] font-semibold transition-colors"
        >
          ← 홈으로
        </Link>
      </footer>
    </article>
  </div>
);
