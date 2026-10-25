import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-border-main bg-bg-main mt-auto flex items-center justify-center border-t px-5 py-6 text-center">
      <div className="w-full max-w-200">
        <p className="text-text-main mb-3 text-[0.95rem] font-semibold">
          © 2026{' '}
          <span className="font-black tracking-tight">
            Clean<span className="text-primary">Watch</span>
          </span>
          . All rights reserved.
        </p>

        <p className="text-text-muted text-[0.85rem] leading-relaxed opacity-70">
          Not affiliated with Blizzard Entertainment. Overwatch is a trademark
          of Blizzard Entertainment, Inc.
        </p>

        {/* flex-wrap: 없으면 좁은 화면에서 푸터가 화면 밖으로 밀린다 */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3.75 gap-y-1.5">
          <Link
            to="/terms"
            className="text-text-muted hover:text-primary text-[0.9rem] font-medium transition-colors duration-200"
          >
            이용약관
          </Link>
          <Link
            to="/privacy"
            className="text-text-muted hover:text-primary text-[0.9rem] font-medium transition-colors duration-200"
          >
            개인정보처리방침
          </Link>
          <a
            href="https://github.com/CleanWatch/Clean.Watch/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-primary text-[0.9rem] font-medium transition-colors duration-200"
          >
            문의 · 버그 제보 (GitHub)
          </a>
        </div>
      </div>
    </footer>
  );
};
