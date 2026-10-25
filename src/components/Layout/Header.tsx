import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';
import { useLogoutMutation, useUser } from '@/hooks';

const LINK =
  'text-text-muted hover:text-text-main text-[15px] transition-colors';

const ACTION = cn(
  'rounded-lg border px-3 py-1.5 text-[13px] font-bold transition-all',
  'border-border-main text-text-muted hover:border-primary hover:text-primary',
);

export const Header = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { data: user } = useUser();
  const { mutate: handleLogout } = useLogoutMutation();

  const isAdmin = user?.role === 'admin';

  return (
    <header className="border-border-main bg-bg-main sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 w-full max-w-300 items-center gap-10 px-5 sm:px-10">
        <Link
          to="/"
          className="font-display text-text-main text-[1.7rem] font-bold tracking-[0.06em] uppercase transition-opacity hover:opacity-80"
        >
          Clean<span className="text-primary">Watch</span>
        </Link>

        <nav
          aria-label="주요 메뉴"
          className="hidden grow items-center gap-7 sm:flex"
        >
          <Link to="/ranking" className={LINK}>
            신고 랭킹
          </Link>
          {/* 비로그인이면 신고 화면 대신 로그인으로 보낸다 */}
          <Link to={isLoggedIn ? '/report' : '/login'} className={LINK}>
            신고하기
          </Link>
        </nav>

        <nav className="ml-auto flex items-center gap-2 sm:ml-0">
          {isLoggedIn ? (
            <>
              {user?.username && (
                <span className="text-text-muted mr-1 hidden text-[13px] sm:inline">
                  <span
                    className={cn(
                      'font-bold',
                      isAdmin ? 'text-danger' : 'text-text-main',
                    )}
                  >
                    {user.username}
                  </span>{' '}
                  님
                </span>
              )}
              <Link to="/mypage" className={ACTION}>
                마이페이지
              </Link>
              <button
                type="button"
                onClick={() => handleLogout()}
                className={ACTION}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-primary hover:bg-primary-hover text-bg-main inline-flex h-11 items-center rounded-md px-5 text-[15px] font-bold transition-all"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
