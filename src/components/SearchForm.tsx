import { useState, type SyntheticEvent } from 'react';
import {
  BATTLETAG_PLACEHOLDER,
  BATTLETAG_FORMAT_ERROR,
  cn,
  isValidBattletag,
} from '@/utils';

interface SearchFormProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  executeSearch: (e: SyntheticEvent<HTMLFormElement>) => void;
  clearResult: () => void;
  isSearching?: boolean;
}

export const SearchForm = ({
  searchQuery,
  setSearchQuery,
  executeSearch,
  clearResult,
  isSearching = false,
}: SearchFormProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 형식 검사를 통과할 때만 부모의 executeSearch를 부른다
  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault(); // 기본 폼 제출(새로고침) 방지

    const query = searchQuery.trim();

    // 여기서 막으면 executeSearch가 안 불리니 이전 결과도 직접 내린다
    if (!query) {
      setErrorMessage('배틀태그를 입력해주세요.');
      clearResult();
      return;
    }

    if (!isValidBattletag(query)) {
      setErrorMessage(BATTLETAG_FORMAT_ERROR);
      clearResult();
      return;
    }

    setErrorMessage(null);
    executeSearch(e);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* 넓은 화면에선 입력칸과 버튼이 한 테두리 안에 묶이고, 좁은 화면에선 위아래로 쌓인다 */}
      <div
        className={cn(
          'flex flex-col gap-2.5 transition-colors duration-200 sm:flex-row sm:items-center sm:gap-2',
          'sm:border-border-strong sm:bg-bg-card sm:focus-within:border-primary sm:rounded-xl sm:border sm:p-2',
          errorMessage && 'sm:border-danger sm:focus-within:border-danger',
        )}
      >
        {/* placeholder는 라벨을 대신하지 못해 sr-only 라벨을 둔다 */}
        <label htmlFor="battletag-search" className="sr-only">
          배틀태그 검색
        </label>
        <input
          id="battletag-search"
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={BATTLETAG_PLACEHOLDER}
          maxLength={20}
          disabled={isSearching}
          className={cn(
            // min-w-0: flex 아이템 기본 min-width가 auto라 없으면 좁은 화면에서 버튼이 밀려난다
            'h-15 w-full min-w-0 rounded-lg px-4 text-lg transition-all duration-200 outline-none',
            'border-border-strong bg-bg-card text-text-main border',
            'placeholder:text-text-muted',
            'focus:border-primary focus:ring-primary focus:ring-1',
            'sm:h-14 sm:flex-1 sm:border-0 sm:bg-transparent sm:text-xl sm:focus:ring-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            errorMessage &&
              'border-danger focus:border-danger focus:ring-danger',
          )}
        />

        <button
          type="submit"
          disabled={isSearching}
          className={cn(
            'h-14 w-full rounded-lg text-[17px] font-bold whitespace-nowrap transition-all duration-200 sm:w-auto sm:px-9 sm:text-lg',
            'bg-primary hover:bg-primary-hover text-bg-main active:scale-[0.97]',
            'disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isSearching ? '검색 중...' : '검색'}
        </button>
      </div>

      {errorMessage && (
        <p className="text-danger mt-2 pl-1 text-sm font-medium">
          {errorMessage}
        </p>
      )}
    </form>
  );
};
