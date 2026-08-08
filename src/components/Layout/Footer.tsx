import { Link } from 'react-router-dom';
// import { useCopyToClipboard } from '@/hooks';

export const Footer = () => {
  // const { isCopied, copyToClipboard } = useCopyToClipboard();

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

        {/* flex-wrap: 좁은 화면에서 링크 세 개가 한 줄에 들어가지 않습니다.
            없으면 부모를 밀어내 푸터가 화면 밖으로 나갑니다. */}
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

        {/* 
        아래는 되살릴 때를 위해 남겨둡니다. 다만 두 주소 모두 그대로 쓰면 안 됩니다.
        이메일 → admin@cleanwatch.cloud (아직 수신 안 됨. Zoho 무료로 개설 가능)
        디스코드 → 실제 초대 링크 discord.gg/... (서버 아직 없음)
        */}
        {/*
        복사 버튼
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
          */}

        {/* <span className="text-border-main text-[0.8rem]">|</span> */}

        {/* 디스코드 링크 */}
        {/*
        <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-primary text-[0.9rem] font-medium transition-colors duration-200"
          >
            Join Discord
          </a>
          */}
      </div>
    </footer>
  );
};
