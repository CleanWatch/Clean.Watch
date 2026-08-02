// src/pages/MyPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';
import { DashboardTab, ReportsTab, SettingsTab } from './components';

type TabType = 'dashboard' | 'reports' | 'settings';

export const MyPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[calc(100dvh-160px)] flex-col items-center justify-center gap-4 text-white">
        <h2 className="text-xl font-bold">로그인이 필요한 페이지입니다.</h2>
        <button
          onClick={() => navigate('/login')}
          className="bg-primary rounded-lg px-6 py-2 font-bold text-white"
        >
          로그인하기
        </button>
      </div>
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
