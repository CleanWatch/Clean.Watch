import { Link } from 'react-router-dom';

const LINK =
  'text-text-muted hover:text-primary inline-flex min-h-11 items-center text-sm transition-colors duration-200';

export const Footer = () => {
  return (
    <footer className="border-border-main bg-bg-main mt-auto border-t">
      <div className="mx-auto flex w-full max-w-300 flex-col gap-4 px-5 py-8 sm:px-10 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div>
          <p className="text-text-main mb-2 text-[0.95rem] font-semibold">
            © 2026{' '}
            <span className="font-black tracking-tight">
              Clean<span className="text-primary">Watch</span>
            </span>
            . All rights reserved.
          </p>

          <p className="text-text-muted max-w-140 text-[0.85rem] leading-relaxed">
            Not affiliated with Blizzard Entertainment. Overwatch is a trademark
            of Blizzard Entertainment, Inc.
          </p>
        </div>

        {/* flex-wrap: 없으면 좁은 화면에서 푸터가 화면 밖으로 밀린다 */}
        <nav
          aria-label="약관 및 문의"
          className="flex flex-wrap items-center gap-x-5 gap-y-1"
        >
          <Link to="/terms" className={LINK}>
            이용약관
          </Link>
          <Link to="/privacy" className={LINK}>
            개인정보처리방침
          </Link>
          <a
            href="https://github.com/CleanWatch/Clean.Watch/issues"
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            문의 · 버그 제보 (GitHub)
          </a>
        </nav>
      </div>
    </footer>
  );
};
