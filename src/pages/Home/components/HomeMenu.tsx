import { Flag, ShieldCheck, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';
import { useLogoutMutation, useUser } from '@/hooks';

// 세로로 쌓이는 칸에는 flex-1을 쓰지 않는다. 높이가 auto인 부모에서 basis가 0이 되어
// h-14가 무시되고 글자 높이로 납작해진다.
const BUTTON =
  'flex h-14 w-full items-center justify-center gap-2 rounded-lg text-[16px] font-bold transition-all duration-200 active:scale-[0.97]';
const FILLED = 'bg-primary hover:bg-primary-hover text-bg-main';
const OUTLINED =
  'border-primary text-primary hover:bg-primary hover:text-bg-main border';
const QUIET =
  'border-border-main text-text-main hover:border-primary hover:text-primary border';

export const HomeMenu = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { mutate: handleLogout } = useLogoutMutation();
  const { data: user, isLoading } = useUser();

  if (!isLoggedIn) {
    return (
      <div className="border-border-main border-t pt-6 lg:pt-8">
        <Link to="/login" className={cn(BUTTON, OUTLINED)}>
          신고하기
        </Link>
        <p className="text-text-muted mt-3 text-[13px] lg:text-sm">
          신고는 로그인 후 이용할 수 있습니다.
        </p>
      </div>
    );
  }

  // 유저 정보 로딩 중 깜빡임 방지
  if (isLoading) {
    return (
      <div className="border-border-main text-text-muted flex h-40 items-center border-t text-[15px]">
        유저 정보를 불러오는 중...
      </div>
    );
  }

  const userName = user?.username;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="border-border-main flex flex-col gap-3 border-t pt-6 lg:pt-8">
      <p className="text-text-main mb-2 text-[15px]">
        {isAdmin ? (
          <>
            <span className="text-danger font-extrabold">{userName}</span>{' '}
            <span className="text-text-muted">관리자 계정 작동 중</span>
          </>
        ) : (
          <>
            반갑습니다,{' '}
            <span className="text-primary font-bold">{userName}</span> 님!
          </>
        )}
      </p>

      <Link to="/report" className={cn(BUTTON, FILLED)}>
        <Flag className="shrink-0" size={18} aria-hidden="true" />
        신고하기
      </Link>
      <Link to="/mypage" className={cn(BUTTON, QUIET)}>
        <User className="shrink-0" size={18} aria-hidden="true" />
        마이페이지
      </Link>

      {isAdmin && (
        <Link
          to="/admin"
          className={cn(
            BUTTON,
            'bg-danger hover:bg-danger-hover text-bg-main hover:-translate-y-px',
          )}
        >
          <ShieldCheck className="shrink-0" size={18} aria-hidden="true" />
          관리자 대시보드
        </Link>
      )}

      <button
        type="button"
        onClick={() => handleLogout()}
        className={cn(
          BUTTON,
          'border-border-main text-text-muted hover:border-primary hover:text-primary h-13 border bg-transparent text-[14px]',
        )}
      >
        로그아웃
      </button>
    </div>
  );
};
