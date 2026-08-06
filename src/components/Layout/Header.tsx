/* src/components/Layout/Header.tsx */

import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';
import { useLogoutMutation, useUser } from '@/hooks';

/**
 * 모든 페이지 위에 붙는 막대.
 *
 * 로고가 곧 홈 버튼입니다. 예전에는 신고·회원가입 화면에서 홈으로 갈 방법이
 * 브라우저 뒤로가기뿐이었는데, 여기가 생기면서 앞으로 만들 페이지까지 같이
 * 해결됩니다.
 *
 * 랭킹·신고 같은 메뉴는 일부러 넣지 않았습니다. HomeMenu가 홈 화면에서 큰 버튼으로
 * 안내하고 있어서, 여기에 또 넣으면 홈에서만 같은 메뉴가 두 번 보입니다.
 */
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
              {/* 좁은 화면에서는 로고와 버튼 둘을 넣을 자리밖에 없습니다. */}
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
