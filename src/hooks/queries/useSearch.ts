import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResult } from '@/api';

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedTag, setSearchedTag] = useState('');

  // SearchForm이 제출을 막았을 때만 부른다. 결과 패널에 태그가 적혀 있어서
  // 타이핑 중에 지울 필요가 없고, 지우면 화면만 튄다.
  const clearResult = () => setSearchedTag('');

  const {
    data,
    isFetching: isSearching,
    isError,
  } = useQuery({
    queryKey: ['searchResult', searchedTag],
    queryFn: () => fetchSearchResult(searchedTag),
    enabled: !!searchedTag,
    // 새 검색 중에도 옛 결과를 남겨 패널이 깜빡이지 않게 한다
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  // 실패를 "기록 없음"으로 보여주면 정반대 의미가 된다
  const searchError = isError
    ? '검색에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    : '';
  // keepPreviousData는 쿼리를 꺼도 옛 데이터를 주므로 searchedTag로 한 번 더 거른다
  const searchResult = !searchedTag || isError ? null : (data ?? null);

  // 형식 검사는 SearchForm이 한다
  const executeSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const targetTag = searchQuery.trim();
    if (!targetTag) return;

    setSearchedTag(targetTag);
  };

  return {
    searchQuery,
    setSearchQuery,
    clearResult,
    searchResult,
    isSearching,
    executeSearch,
    searchedTag,
    searchError,
  };
}
