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
    <form onSubmit={handleSubmit} className="mx-auto w-full">
      <div className="flex items-center gap-3">
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
            'h-14 min-w-0 flex-1 rounded-lg px-5 text-[17px] transition-all duration-200 outline-none',
            'border-border-main bg-bg-main text-text-main border',
            'placeholder:text-text-muted',
            'focus:border-primary focus:bg-bg-card focus:ring-primary focus:ring-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            errorMessage &&
              'border-danger focus:border-danger focus:ring-danger',
          )}
        />

        <button
          type="submit"
          disabled={isSearching}
          className={cn(
            // 좁은 화면에선 버튼 여백을 줄여 입력칸에 넘긴다
            'h-14 rounded-lg px-5 text-[17px] font-bold whitespace-nowrap transition-all duration-200 sm:px-7',
            'bg-primary hover:bg-primary-hover text-white active:scale-[0.96]',
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
