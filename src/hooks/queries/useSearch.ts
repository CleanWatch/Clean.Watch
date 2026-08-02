/* src/hooks/queries/useSearch.ts */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSearchResult } from '@/api';

export function useSearch() {
  // Form UI 관련 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedTag, setSearchedTag] = useState('');

  // 입력이 바뀌면 이전 결과를 내립니다.
  //
  // 화면에 남겨두면 입력칸의 배틀태그와 결과의 배틀태그가 서로 다른 상태가 됩니다.
  // 특히 형식이 틀린 값을 넣으면 SearchForm이 제출을 막아 executeSearch가 아예
  // 호출되지 않으므로, 여기서 내리지 않으면 새 에러 아래에 옛 결과가 계속 붙어 있습니다.
  const handleQueryChange = (value: string) => {
    setSearchQuery(value);
    if (searchedTag) setSearchedTag('');
  };
  // 검색 실패 문구. 지금은 채우는 곳이 없고, 다음 단계에서 조회 실패를 여기에 담습니다.
  const [searchError] = useState('');

  // React Query 적용 (데이터 통신 및 상태 자동 관리)
  // searchedTag가 변경되면 fetchSearchResult 호출
  const { data: searchResult = null, isFetching: isSearching } = useQuery({
    queryKey: ['searchResult', searchedTag],
    queryFn: () => fetchSearchResult(searchedTag),
    // 핵심: searchedTag가 빈 값이 아닐 때만 쿼리를 실행하도록 방어막 설정
    enabled: !!searchedTag,
    // 동일한 유저를 연속해서 검색할 때 불필요한 과금을 막기 위한 5분 캐싱
    staleTime: 1000 * 60 * 5,
    retry: 0, // 검색 실패 시 재시도하지 않음
  });

  // 3. 폼 제출(Submit) 핸들러
  //
  // 형식 검사는 하지 않습니다. SearchForm이 제출 전에 같은 isValidBattletag로
  // 걸러내고 return하므로, 여기에 있던 검사는 실행될 수 없었습니다.
  // 검사를 한 곳에만 두면 에러 문구가 어디에 뜨는지도 하나로 정해집니다.
  const executeSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const targetTag = searchQuery.trim();
    if (!targetTag) return;

    // 검증을 통과 시 searchedTag 상태만 업데이트합니다.
    // 상태가 업데이트되면 React Query의 `queryKey`가 변하면서 자동으로 검색 API(통신) 실행
    setSearchedTag(targetTag);
  };

  // 컴포넌트에서 사용할 수 있도록 반환
  return {
    searchQuery,
    // 화면에는 결과를 내리는 쪽을 넘깁니다.
    setSearchQuery: handleQueryChange,
    searchResult,
    isSearching,
    executeSearch,
    searchedTag,
    searchError,
  };
}
