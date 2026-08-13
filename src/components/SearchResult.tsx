import { Hammer, Search } from 'lucide-react';
import { useState } from 'react';
import { cn, formatRelativeTime } from '@/utils';
import type { SearchResultData } from '@/types';

// 레거시의 3단 상태(null, false, object)를 TS로 방어
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
  // 컴포넌트 내부에서만 쓰이는 단순 UI 상태이므로 useState 유지 (정석)
  const [showNotice, setShowNotice] = useState(false);

  // false(신고 없음)와 null(검색 전)은 둘 다 falsy라, 이 삼항으로 객체인 경우만
  // 걸러집니다. 필드가 없는 옛 문서면 포맷터가 null을 돌려줍니다.
  const lastReported = searchResult
    ? formatRelativeTime(searchResult.lastReportedAt)
    : null;

  // ✨ 핵심: early return(중간에 끝내기)을 없애고, 무조건 껍데기(wrapper)를 그리는 레거시 철학 유지
  return (
    <div className="mt-6 w-full">
      {/* 1순위: 에러가 발생했을 때.
          틴트를 쓰지 않는 이유는 아래 결과 패널이 초록·빨강 틴트로 답을 나르기
          때문입니다. 에러에도 빨간 틴트를 두면 "형식이 틀렸다"와 "이 유저는
          신고당했다"가 같은 화면이 되는데, 사용자가 할 일은 정반대입니다. */}
      {searchError && (
        <div className="border-border-main bg-bg-card flex min-h-25 items-center justify-center rounded-lg border p-6">
          <p className="text-danger text-[15px] font-bold">{searchError}</p>
        </div>
      )}

      {/* 2순위: 에러가 없고, 검색 결과가 존재할 때 (null이 아닐 때) */}
      {!searchError && searchResult !== null && (
        <div
          className={cn(
            'flex min-h-25 flex-col items-center justify-center rounded-lg border p-6 transition-all duration-300',
            // 패널 색이 곧 답입니다. 다만 색만으로 판단하게 두면 적록색약인
            // 사용자는 구분할 수 없으므로, 문장이 결과를 그대로 말합니다.
            searchResult === false
              ? 'border-emerald-400/35 bg-emerald-400/10'
              : 'border-danger/35 bg-danger/10',
          )}
        >
          {/* 경우 A: 신고 내역이 없는 클린 유저 (searchResult === false) */}
          {searchResult === false ? (
            <p className="text-text-main text-[16px]">
              <strong className="text-emerald-400">{searchedTag}</strong> 유저는
              접수된 신고 내역이 없습니다.
            </p>
          ) : (
            /* 경우 B: 신고 내역이 존재하는 타겟 유저 (객체) */
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

              {/* 같은 "3번"이라도 어제 일과 8개월 전 일은 읽는 사람에게 전혀 다른
                  정보입니다. 시점이 없으면 옛 기록이 현재형으로 읽힙니다.
                  값이 없는 옛 문서는 줄을 그리지 않습니다 — 채워 넣으면
                  "모른다"와 "오래됐다"가 같아집니다. */}
              {lastReported && (
                <p className="text-text-muted mt-1.5 text-[13px] font-medium">
                  최근 신고 {lastReported}
                </p>
              )}

              <button
                onClick={() => setShowNotice(true)}
                className={cn(
                  'mt-5 flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-[14px] font-bold transition-all duration-200',
                  'bg-primary hover:bg-primary-hover text-white active:scale-[0.96]',
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
