import { cn } from '@/utils';
import { useSearch, useStats } from '@/hooks';

import { SearchForm, SearchResult } from '@/components';
import { HomeMenu, HomeStats } from './components';

export const Home = () => {
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

  const { reportCount, battleTagCount, isLoading } = useStats();

  return (
    <div className="flex grow items-center justify-center p-5">
      <div
        className={cn(
          'border-border-main bg-bg-card w-full max-w-125 rounded-2xl border text-center shadow-2xl',
          'px-6 py-9 transition-all duration-300 sm:px-10 sm:py-12',
        )}
      >
        <h1 className="text-primary mb-1 text-[2.2rem] font-black tracking-tight sm:text-[3rem]">
          CleanWatch
        </h1>
        <p className="text-text-muted mb-10 text-[15px] sm:text-base">
          오버워치 커뮤니티 신고 플랫폼
        </p>

        <SearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          executeSearch={executeSearch}
          clearResult={clearResult}
          isSearching={isSearching}
        />

        <SearchResult
          searchResult={searchResult}
          searchedTag={searchedTag}
          searchError={searchError}
        />

        <HomeMenu />

        <HomeStats
          reportCount={reportCount}
          battleTagCount={battleTagCount}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
