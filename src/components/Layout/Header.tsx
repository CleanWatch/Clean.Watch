import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';
import { useLogoutMutation, useUser } from '@/hooks';

// 로고가 홈 버튼이다. 메뉴는 홈의 HomeMenu와 겹쳐서 일부러 안 넣었다.
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
      <div className="mx-auto flex h-14 w-full max-w-300 items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="text-text-main text-[15px] font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          Clean<span className="text-primary">Watch</span>
        </Link>

        <nav className="flex items-center gap-2">
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
              className="bg-primary hover:bg-primary-hover rounded-lg px-4 py-1.5 text-[13px] font-bold text-white transition-all"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
