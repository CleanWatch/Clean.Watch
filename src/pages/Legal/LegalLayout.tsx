import { Link } from 'react-router-dom';

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
  <div className="flex flex-1 justify-center p-4 sm:p-5">
    <article className="border-border-main bg-bg-card text-text-main w-full max-w-200 rounded-2xl border p-6 sm:p-10">
      <header className="border-border-main mb-8 border-b pb-6">
        <h1 className="text-[26px] font-extrabold tracking-tight sm:text-[30px]">
          {title}
        </h1>
        <p className="text-text-muted mt-2 text-[13px]">
          시행일 {effectiveDate}
        </p>
      </header>

      <div className="text-[15px] leading-relaxed">{children}</div>

      <footer className="border-border-main mt-10 border-t pt-6">
        <Link
          to="/"
          className="text-primary hover:text-primary-hover text-[14px] font-semibold transition-colors"
        >
          ← 홈으로
        </Link>
      </footer>
    </article>
  </div>
);
