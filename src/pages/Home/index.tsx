/* src/pages/Home.tsx */

import { cn } from '@/utils';
import { useSearch, useStats } from '@/hooks';

// 컴포넌트 4인방
import { SearchForm, SearchResult } from '@/components';
import { HomeMenu, HomeStats } from './components';

export const Home = () => {
  // 비즈니스 로직 훅 (View와 완전히 분리됨)
  // [!] 더 이상 useAuth를 여기서 부를 필요 없음. (HomeMenu 담당)
  const {
    searchQuery,
    setSearchQuery,
    clearResult,
    searchResult,
    isSearching,
    executeSearch,
    searchedTag,
    searchError,
  } = useSearch();

  const { reportCount, battleTagCount } = useStats();

  // 순수 선언적 렌더링 (UI 껍데기)
  return (
    // 모바일 브라우저 주소창 꿀렁임 방지 (100dvh) 완벽 이식
    <div className="flex min-h-[calc(100dvh-160px)] items-center justify-center p-5">
      <div
        className={cn(
          // 공통 스타일 (다크 테마 카드)
          'border-border-main bg-bg-card w-full max-w-125 rounded-2xl border text-center shadow-2xl',
          // 반응형 패딩: 모바일에서는 px-6 py-9, PC(sm)에서는 px-10 py-12
          'px-6 py-9 transition-all duration-300 sm:px-10 sm:py-12',
        )}
      >
        {/* 상단 타이틀 영역 */}
        <h1 className="text-primary mb-1 text-[2.2rem] font-black tracking-tight sm:text-[3rem]">
          OW Watch
        </h1>
        <p className="text-text-muted mb-10 text-[15px] sm:text-base">
          오버워치 커뮤니티 신고 플랫폼
        </p>

        {/* 검색 구역 (상태 주입) */}
        <SearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          executeSearch={executeSearch}
          clearResult={clearResult}
          isSearching={isSearching}
        />

        {/* 검색 결과 구역 */}
        <SearchResult
          searchResult={searchResult}
          searchedTag={searchedTag}
          searchError={searchError}
        />

        {/* 유저 메뉴 구역 (Props 없이 스스로 전역 상태 구독) */}
        <HomeMenu />

        {/* 하단 통계 구역 */}
        <HomeStats reportCount={reportCount} battleTagCount={battleTagCount} />
      </div>
    </div>
  );
};
