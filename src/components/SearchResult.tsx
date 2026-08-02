import { useState } from 'react';
import { cn } from '@/utils';

// 검색 결과 객체 형태 정의
interface SearchResultData {
  battletag: string;
  reportCount: number;
}

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

  // ✨ 핵심: early return(중간에 끝내기)을 없애고, 무조건 껍데기(wrapper)를 그리는 레거시 철학 유지
  return (
    <div className="mt-6 w-full">
      {/* 1순위: 에러가 발생했을 때 */}
      {searchError && (
        <div className="border-danger/30 bg-danger/10 flex min-h-25 items-center justify-center rounded-lg border p-6">
          <p className="text-danger text-[15px] font-bold">{searchError}</p>
        </div>
      )}

      {/* 2순위: 에러가 없고, 검색 결과가 존재할 때 (null이 아닐 때) */}
      {!searchError && searchResult !== null && (
        <div className="border-border-main bg-bg-card flex min-h-25 flex-col items-center justify-center rounded-lg border p-6 transition-all duration-300">
          {/* 경우 A: 신고 내역이 없는 클린 유저 (searchResult === false) */}
          {searchResult === false ? (
            <p className="text-text-main text-[16px]">
              <span className="mr-2">🟢</span>
              <strong className="text-emerald-400">{searchedTag}</strong> 유저는
              접수된 신고 내역이 없습니다.
            </p>
          ) : (
            /* 경우 B: 신고 내역이 존재하는 타겟 유저 (객체) */
            <div className="flex flex-col items-center text-center">
              <p className="text-text-main text-[16px]">
                <span className="mr-2">🚨</span>
                <strong className="text-danger">
                  {searchResult.battletag}
                </strong>{' '}
                유저는 현재까지
                <span className="text-danger mx-1 text-[22px] font-black">
                  {searchResult.reportCount}번
                </span>
                신고되었습니다!
              </p>

              {/* 상세 기록 보기 버튼 */}
              <button
                onClick={() => setShowNotice(true)}
                className={cn(
                  'mt-5 flex h-11 items-center justify-center rounded-lg px-6 text-[14px] font-bold transition-all duration-200',
                  'bg-primary hover:bg-primary-hover text-white active:scale-[0.96]',
                )}
              >
                🔍 상세 전과 기록 보기
              </button>

              {/* 준비 중 안내 메시지 */}
              {showNotice && (
                <p className="text-text-muted mt-4 text-[13px] font-medium">
                  🛠️ 상세 신고 기록실 타임라인 준비 중입니다...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
