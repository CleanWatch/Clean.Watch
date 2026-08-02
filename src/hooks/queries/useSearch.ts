/* src/hooks/queries/useSearch.ts */

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResult } from '@/api';

export function useSearch() {
  // Form UI 관련 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedTag, setSearchedTag] = useState('');

  // 결과를 내립니다. SearchForm이 제출을 막았을 때(빈 값·형식 오류) 부릅니다.
  //
  // 타이핑할 때마다 내리지 않는 이유는, 결과 패널이 배틀태그를 같이 적고 있어
  // 입력칸과 달라도 누구 결과인지 스스로 밝히기 때문입니다. 한 글자 칠 때마다
  // 답이 사라지면 읽던 사람만 손해고, 패널이 빠지면서 화면도 위로 튑니다.
  const clearResult = () => setSearchedTag('');

  // React Query 적용 (데이터 통신 및 상태 자동 관리)
  // searchedTag가 변경되면 fetchSearchResult 호출
  const {
    data,
    isFetching: isSearching,
    isError,
  } = useQuery({
    queryKey: ['searchResult', searchedTag],
    queryFn: () => fetchSearchResult(searchedTag),
    // 핵심: searchedTag가 빈 값이 아닐 때만 쿼리를 실행하도록 방어막 설정
    enabled: !!searchedTag,
    // 새 검색이 도는 동안 옛 결과를 남겨 둡니다. 없으면 패널이 사라졌다
    // 다시 나타나면서 화면이 튑니다. 도는 중이라는 건 isSearching으로 알립니다.
    placeholderData: keepPreviousData,
    // 동일한 유저를 연속해서 검색할 때 불필요한 과금을 막기 위한 5분 캐싱
    staleTime: 1000 * 60 * 5,
    retry: 0, // 검색 실패 시 재시도하지 않음
  });

  // 조회에 실패하면 data가 비어 "신고 내역이 없습니다"가 됩니다.
  // 못 불러온 것과 기록이 없는 것은 정반대인데 화면에는 같게 나오므로,
  // 실패일 때는 결과를 지우고 에러 쪽으로 보냅니다.
  const searchError = isError
    ? '검색에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    : '';
  //
  // searchedTag가 비면 무조건 아무것도 없는 상태입니다. keepPreviousData가
  // 쿼리를 끈 뒤에도 옛 데이터를 placeholder로 계속 내주기 때문에, 이 조건이
  // 없으면 clearResult()를 불러도 패널이 그대로 남습니다.
  const searchResult = !searchedTag || isError ? null : (data ?? null);

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
    setSearchQuery,
    clearResult,
    searchResult,
    isSearching,
    executeSearch,
    searchedTag,
    searchError,
  };
}
