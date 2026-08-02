// src/pages/MyPage.tsx
import { useState } from 'react';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';
import { ErrorState, ErrorAction } from '@/components';
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
    <div className="flex min-h-[calc(100dvh-160px)] w-full justify-center px-4 py-10 sm:px-6">
      <div className="border-border-main bg-bg-card flex w-full max-w-212.5 flex-col overflow-hidden rounded-2xl border shadow-2xl">
        {/* 상단 탭 (Tab) 내비게이션 */}
        <div className="border-border-main bg-bg-main/50 flex border-b">
          {(['dashboard', 'reports', 'settings'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-4 text-sm font-bold transition-all sm:text-base',
                activeTab === tab
                  ? 'border-primary text-primary border-b-2'
                  : 'text-text-muted hover:text-text-main hover:bg-white/5',
              )}
            >
              {tab === 'dashboard' && '대시보드'}
              {tab === 'reports' && '신고 내역'}
              {tab === 'settings' && '프로필 설정'}
            </button>
          ))}
        </div>

        {/* 탭 내용 렌더링 컨테이너 */}
        <div className="p-6 sm:p-10">
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
