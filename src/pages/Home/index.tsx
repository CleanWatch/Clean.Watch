import { useSearch, useStats } from '@/hooks';

import { SearchForm, SearchResult } from '@/components';
import { HomeMenu, HomeRankingPreview, HomeStats } from './components';

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
    <div className="mx-auto w-full max-w-300 grow px-5 sm:px-10">
      <section className="pt-12 pb-12 sm:pt-24 sm:pb-16">
        <p className="text-primary mb-4 text-[13px] font-bold tracking-[0.08em] sm:mb-5 sm:text-sm">
          오버워치 커뮤니티 신고 플랫폼
        </p>
        <h1 className="text-text-main text-[2.1rem] leading-[1.22] font-extrabold tracking-tight break-keep sm:text-[3.75rem] sm:leading-[1.18]">
          게임 시작 전,
          <br />이 배틀태그부터 확인하세요
        </h1>
        <p className="text-text-muted mt-5 max-w-140 text-base leading-relaxed break-keep sm:mt-6 sm:text-lg">
          커뮤니티에 쌓인 신고 현황을 배틀태그로 바로 조회합니다.
        </p>

        <div className="mt-8 max-w-190 sm:mt-11">
          <SearchForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            executeSearch={executeSearch}
            clearResult={clearResult}
            isSearching={isSearching}
          />
          <p className="text-text-muted mt-4 text-[13px] sm:text-sm">
            같은 사람이 여러 번 신고해도 1명으로 집계합니다.
          </p>

          <SearchResult
            searchResult={searchResult}
            searchedTag={searchedTag}
            searchError={searchError}
          />
        </div>
      </section>

      <div className="flex flex-col gap-10 pb-16 sm:pb-24 lg:flex-row lg:gap-16">
        <HomeRankingPreview />

        <aside className="flex flex-col gap-8 lg:w-80 lg:shrink-0 lg:gap-10">
          <HomeStats
            reportCount={reportCount}
            battleTagCount={battleTagCount}
            isLoading={isLoading}
          />
          <HomeMenu />
        </aside>
      </div>
    </div>
  );
};
