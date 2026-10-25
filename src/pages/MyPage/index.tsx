import { useState } from 'react';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';
import { ErrorState, ErrorAction, PageHeader } from '@/components';
import { DashboardTab, ReportsTab, SettingsTab } from './components';

type TabType = 'dashboard' | 'reports' | 'settings';

export const MyPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return (
      <ErrorState
        label="로그인"
        title="로그인이 필요한 페이지입니다"
        description="마이페이지는 로그인 후 이용할 수 있습니다."
        actions={
          <>
            <ErrorAction to="/login">로그인하기</ErrorAction>
            <ErrorAction to="/" variant="secondary">
              홈으로
            </ErrorAction>
          </>
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-300 grow px-5 sm:px-10">
      <PageHeader
        eyebrow="마이페이지"
        title="내 계정"
        className="pb-6 sm:pb-8"
      />

      <div className="max-w-190 pb-16 sm:pb-24">
        <div
          role="tablist"
          aria-label="마이페이지 메뉴"
          className="border-border-main flex gap-6 border-b sm:gap-8"
        >
          {(['dashboard', 'reports', 'settings'] as TabType[]).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                '-mb-px min-h-11 border-b-2 py-3 text-[15px] font-bold transition-colors sm:text-base',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'text-text-muted hover:text-text-main border-transparent',
              )}
            >
              {tab === 'dashboard' && '대시보드'}
              {tab === 'reports' && '신고 내역'}
              {tab === 'settings' && '프로필 설정'}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="pt-8 sm:pt-10">
          {activeTab === 'dashboard' && (
            <DashboardTab onNavigateSettings={() => setActiveTab('settings')} />
          )}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'settings' && (
            <SettingsTab
              onNavigateDashboard={() => setActiveTab('dashboard')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
