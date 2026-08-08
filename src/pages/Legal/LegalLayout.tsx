import { Link } from 'react-router-dom';

/**
 * 약관·방침 공용 셸.
 *
 * 두 문서의 조판을 한곳에 모읍니다. 본문에서 쓰는 요소(제목·문단·표·목록)는
 * `elements.tsx`에 있고, `L`로 묶어 씁니다.
 *
 * Tailwind Typography 플러그인은 쓰지 않았습니다. 문서 두 개를 위해 의존성을
 * 추가할 만큼 얻는 게 없고, 다크 배경에 맞추려면 어차피 변수를 덮어써야 합니다.
 */
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
