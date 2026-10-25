import { Flag, ShieldCheck, Trophy, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';
import { useLogoutMutation, useUser } from '@/hooks';

export const HomeMenu = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { mutate: handleLogout } = useLogoutMutation();
  const { data: user, isLoading } = useUser();

  if (!isLoggedIn) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/login"
          className={cn(
            'flex h-14 flex-1 items-center justify-center rounded-lg text-[16px] font-bold transition-all duration-200',
            'bg-primary hover:bg-primary-hover text-white active:scale-[0.96]',
          )}
        >
          로그인
        </Link>
        <Link
          to="/ranking"
          className={cn(
            'flex h-14 flex-1 items-center justify-center gap-2 rounded-lg text-[16px] font-bold transition-all duration-200',
            'border-border-main bg-bg-card text-text-main hover:border-primary hover:text-primary border active:scale-[0.96]',
          )}
        >
          <Trophy className="shrink-0" size={18} aria-hidden="true" />
          신고 랭킹
        </Link>
      </div>
    );
  }

  // 유저 정보 로딩 중 깜빡임 방지
  if (isLoading) {
    return (
      <div className="text-text-muted mt-8 flex h-50 items-center justify-center text-[15px]">
        유저 정보를 불러오는 중...
      </div>
    );
  }

  const userName = user?.username;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="mt-8 flex flex-col gap-5">
      <div className="text-text-main text-center text-[15px]">
        {isAdmin ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-danger font-extrabold">{userName}</span>
            <span className="text-text-muted">관리자 계정 작동 중</span>
          </div>
        ) : (
          <div>
            반갑습니다,{' '}
            <span className="text-primary font-bold">{userName}</span> 님!
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link
          to="/report"
          className={cn(
            'col-span-2 flex h-14 items-center justify-center gap-2 rounded-lg text-[16px] font-bold transition-all duration-200 sm:col-span-1',
            'bg-primary hover:bg-primary-hover text-white active:scale-[0.96]',
          )}
        >
          <Flag className="shrink-0" size={18} aria-hidden="true" />
          신고하기
        </Link>
        <Link
          to="/ranking"
          className={cn(
            'flex h-14 items-center justify-center gap-2 rounded-lg text-[16px] font-bold transition-all duration-200',
            'border-border-main bg-bg-card text-text-main hover:border-primary hover:text-primary border active:scale-[0.96]',
          )}
        >
          <Trophy className="shrink-0" size={18} aria-hidden="true" />
          신고 랭킹
        </Link>
        <Link
          to="/mypage"
          className={cn(
            'flex h-14 items-center justify-center gap-2 rounded-lg text-[16px] font-bold transition-all duration-200',
            'border-border-main bg-bg-card text-text-main hover:border-primary hover:text-primary border active:scale-[0.96]',
          )}
        >
          <User className="shrink-0" size={18} aria-hidden="true" />
          마이페이지
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              'col-span-2 mt-2 flex h-14 items-center justify-center gap-2 rounded-lg text-[16px] font-bold transition-all duration-200 sm:col-span-3',
              'bg-danger text-white shadow-[0_4px_12px_rgba(246,82,86,0.2)]',
              'hover:bg-danger-hover hover:-translate-y-px active:scale-[0.98]',
            )}
          >
            {/* 같은 줄 나머지가 전부 아이콘이라 맞춰 둔다 */}
            <ShieldCheck className="shrink-0" size={18} aria-hidden="true" />
            관리자 대시보드
          </Link>
        )}

        <button
          onClick={() => handleLogout()}
          className={cn(
            'col-span-2 flex h-13 items-center justify-center rounded-lg text-[14px] font-bold transition-all duration-200 sm:col-span-3',
            'border-border-main text-text-muted border bg-transparent',
            'hover:border-primary hover:text-primary active:scale-[0.98]',
          )}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};
