import { useCopyToClipboard } from '@/hooks';

export const Footer = () => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <footer className="border-border-main bg-bg-main mt-auto flex items-center justify-center border-t px-5 py-10 text-center">
      <div className="w-full max-w-200">
        <p className="text-text-main mb-3 text-[0.95rem] font-semibold">
          © 2026{' '}
          <span className="text-primary font-black tracking-tight">
            OW Watch
          </span>
          . All rights reserved.
        </p>

        <p className="text-text-muted text-[0.85rem] leading-relaxed opacity-70">
          Not affiliated with Blizzard Entertainment. Overwatch is a trademark
          of Blizzard Entertainment, Inc.
        </p>

        <div className="mt-2 flex items-center justify-center gap-3.75">
          {/* 복사 버튼 */}
          <button
            type="button"
            onClick={() => copyToClipboard('admin@owwatch.com')}
            className={`cursor-pointer text-[0.9rem] transition-colors duration-200 ${
              isCopied
                ? 'font-bold text-green-500' // 복사 완료 시 초록색 (Success)
                : 'text-text-muted hover:text-primary font-medium'
            }`}
          >
            {isCopied ? '이메일 복사 완료!' : '관리자 이메일 (클릭해서 복사)'}
          </button>

          <span className="text-border-main text-[0.8rem]">|</span>

          {/* 디스코드 링크 */}
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-primary text-[0.9rem] font-medium transition-colors duration-200"
          >
            Join Discord
          </a>
        </div>
      </div>
    </footer>
  );
};
