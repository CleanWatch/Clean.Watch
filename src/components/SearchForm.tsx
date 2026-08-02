import { useState, type SyntheticEvent } from 'react';
import { cn, isValidBattletag } from '@/utils';

interface SearchFormProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  executeSearch: (e: SyntheticEvent<HTMLFormElement>) => void;
  isSearching?: boolean;
}

export const SearchForm = ({
  searchQuery,
  setSearchQuery,
  executeSearch,
  isSearching = false,
}: SearchFormProps) => {
  // 폼 내부 UI 전용 에러 상태 관리
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 수문장 역할: 폼 제출 시 유효성을 먼저 검사하고 통과할 때만 부모의 executeSearch 호출
  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault(); // 기본 폼 제출(새로고침) 방지

    const query = searchQuery.trim();

    if (!query) {
      setErrorMessage('배틀태그를 입력해주세요.');
      return;
    }

    if (!isValidBattletag(query)) {
      setErrorMessage('올바른 배틀태그 형식(예: 닉네임#1234)을 입력해주세요.');
      return;
    }

    // 검증을 무사히 통과했다면 에러를 초기화하고 부모 로직(API 호출 등) 실행
    setErrorMessage(null);
    executeSearch(e);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // 사용자가 다시 타이핑을 시작하면 기존 에러 메시지를 지워주는 UX 디테일
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full">
      <div className="flex items-center gap-3">
        {/* 검색 인풋창 */}
        {/* placeholder는 라벨을 대신하지 못합니다. 입력을 시작하면 사라지고,
            스크린리더가 라벨로 읽어준다는 보장도 없습니다. */}
        <label htmlFor="battletag-search" className="sr-only">
          배틀태그 검색
        </label>
        <input
          id="battletag-search"
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="배틀태그 검색 (예: 홍길동#1234)"
          maxLength={20}
          disabled={isSearching}
          className={cn(
            'h-14 flex-1 rounded-lg px-5 text-[17px] transition-all duration-200 outline-none',
            'border-border-main bg-bg-main text-text-main border',
            'placeholder:text-text-muted',
            'focus:border-primary focus:bg-bg-card focus:ring-primary focus:ring-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // 에러가 있을 경우 테두리를 빨간색으로 변경하여 시각적 피드백 제공
            errorMessage &&
              'border-danger focus:border-danger focus:ring-danger',
          )}
        />

        <button
          type="submit"
          disabled={isSearching}
          className={cn(
            'h-14 rounded-lg px-7 text-[17px] font-bold whitespace-nowrap transition-all duration-200',
            'bg-primary hover:bg-primary-hover text-white active:scale-[0.96]',
            'disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isSearching ? '검색 중...' : '검색'}
        </button>
      </div>

      {/* 에러 메시지 렌더링 영역 */}
      {errorMessage && (
        <p className="text-danger mt-2 pl-1 text-sm font-medium">
          {errorMessage}
        </p>
      )}
    </form>
  );
};
