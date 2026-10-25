import { Hammer, Search } from 'lucide-react';
import { useState } from 'react';
import { cn, formatRelativeTime } from '@/utils';
import type { SearchResultData } from '@/types';

// null: 검색 전, false: 신고 없음, 객체: 신고 있음
interface SearchResultProps {
  searchResult: SearchResultData | false | null;
  searchedTag: string;
  searchError: string | null;
}

export const SearchResult = ({
  searchResult,
  searchedTag,
  searchError,
}: SearchResultProps) => {
  const [showNotice, setShowNotice] = useState(false);

  // 옛 문서라 필드가 없으면 null
  const lastReported = searchResult
    ? formatRelativeTime(searchResult.lastReportedAt)
    : null;

  return (
    <div className="mt-6 w-full">
      {/* 에러엔 틴트를 안 쓴다. 결과 패널의 빨간 틴트(신고 있음)와 헷갈린다 */}
      {searchError && (
        <div className="border-border-main bg-bg-card flex min-h-25 items-center justify-center rounded-lg border p-6">
          <p className="text-danger text-[15px] font-bold">{searchError}</p>
        </div>
      )}

      {!searchError && searchResult !== null && (
        <div
          className={cn(
            'flex min-h-25 flex-col items-center justify-center rounded-lg border p-6 transition-all duration-300',
            // 색만으로는 적록색약이 구분 못 하니 문장도 결과를 말한다
            searchResult === false
              ? 'border-emerald-400/35 bg-emerald-400/10'
              : 'border-danger/35 bg-danger/10',
          )}
        >
          {searchResult === false ? (
            <p className="text-text-main text-[16px]">
              <strong className="text-emerald-400">{searchedTag}</strong> 유저는
              접수된 신고 내역이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col items-center text-center">
              <p className="text-text-main text-[16px]">
                <strong className="text-danger">
                  {searchResult.battletag}
                </strong>{' '}
                유저는 현재까지
                <span className="text-danger mx-1 text-[22px] font-black">
                  {searchResult.reportCount}번
                </span>
                신고되었습니다!
              </p>

              {/* 시점이 없으면 옛 기록이 현재형으로 읽힌다. 값이 없는 옛 문서는 줄을 생략한다 */}
              {lastReported && (
                <p className="text-text-muted mt-1.5 text-[13px] font-medium">
                  최근 신고 {lastReported}
                </p>
              )}

              <button
                onClick={() => setShowNotice(true)}
                className={cn(
                  'mt-5 flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-[14px] font-bold transition-all duration-200',
                  'bg-primary hover:bg-primary-hover text-bg-main active:scale-[0.96]',
                )}
              >
                <Search className="shrink-0" size={16} aria-hidden="true" />
                상세 전과 기록 보기
              </button>

              {showNotice && (
                <p className="text-text-muted mt-4 flex items-center justify-center gap-1.5 text-[13px] font-medium">
                  <Hammer className="shrink-0" size={14} aria-hidden="true" />
                  상세 신고 기록실 타임라인 준비 중입니다...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
