// src/pages/Report.tsx
import { cn } from '@/utils';
import { useReport } from './hooks';

export const Report = () => {
  const {
    battleTag,
    setBattleTag,
    reason,
    setReason,
    details,
    setDetails,
    localError,
    setLocalError,
    submitReport,
    isSubmitting,
  } = useReport();

  return (
    <div className="flex min-h-[calc(100dvh-160px)] items-center justify-center p-5">
      <form
        onSubmit={submitReport}
        noValidate // 브라우저 기본 말풍선 툴팁 끄기
        className={cn(
          'border-border-main bg-bg-card w-full max-w-112.5 rounded-2xl border shadow-2xl transition-all duration-300',
          'p-8 sm:p-10',
        )}
      >
        <h1 className="text-text-main mb-8 text-center text-[2rem] font-black tracking-tight">
          🚨 핵 사용자 신고
        </h1>

        <div className="flex flex-col gap-5">
          <label htmlFor="report-battletag" className="sr-only">
            신고할 배틀태그
          </label>
          <input
            id="report-battletag"
            type="text"
            placeholder="배틀태그 입력 (예: Hacker#1234)"
            value={battleTag}
            onChange={(e) => {
              setBattleTag(e.target.value);
              setLocalError(''); // 입력 시 기존 에러 메시지 초기화
            }}
            className={cn(
              'border-border-main bg-bg-main text-text-main w-full rounded-lg border p-4 text-[16px] transition-all duration-200 outline-none',
              'placeholder:text-text-muted focus:border-primary focus:ring-primary focus:ring-1',
            )}
          />

          <select
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setLocalError(''); // 선택 시 기존 에러 메시지 초기화
            }}
            className={cn(
              'border-border-main bg-bg-main text-text-main w-full appearance-none rounded-lg border p-4 text-[16px] transition-all duration-200 outline-none',
              'focus:border-primary focus:ring-primary focus:ring-1',
              reason === '' ? 'text-text-muted' : 'text-text-main',
            )}
          >
            <option value="" disabled>
              신고 사유 선택 (필수)
            </option>
            <option value="비인가 프로그램 (자동 조준/격발)">
              비인가 프로그램 (자동 조준/격발)
            </option>
            <option value="비인가 프로그램 (위치 투시/ESP)">
              비인가 프로그램 (위치 투시/ESP)
            </option>
            <option value="고의적 게임 진행 방해 (패작/트롤링)">
              고의적 게임 진행 방해 (패작/트롤링)
            </option>
            <option value="부적절한 의사소통 (욕설/비하)">
              부적절한 의사소통 (욕설/비하)
            </option>
            <option value="기타 사유">기타 사유</option>
          </select>

          <textarea
            placeholder="핵 사용 정황이나 발생 시간 등 세부사항을 적어주세요. (선택)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className={cn(
              'border-border-main bg-bg-main text-text-main min-h-30 w-full resize-none rounded-lg border p-4 text-[16px] transition-all duration-200 outline-none',
              'placeholder:text-text-muted focus:border-primary focus:ring-primary focus:ring-1',
            )}
          ></textarea>

          {/* 빨간색 에러 메시지 UI */}
          {localError && (
            <p className="text-danger mt-1 text-center text-[13px] font-medium">
              {localError}
            </p>
          )}

          <button
            type="submit"
            // 필수 칸이 비어 있으면 잠급니다. 형식 오류는 눌렀을 때 문구로
            // 알려주지만(타이핑 중 버튼이 깜빡이면 불편), 빈 칸은 "입력 중"이
            // 아니라 "보낼 게 없음"입니다.
            disabled={isSubmitting || !battleTag.trim() || !reason}
            className={cn(
              'mt-2 flex h-14 w-full items-center justify-center rounded-lg text-[16px] font-bold text-white transition-all duration-200',
              'bg-red-500 hover:bg-red-600 active:scale-[0.98]',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isSubmitting ? '접수 중...' : '신고 접수하기'}
          </button>
        </div>
      </form>
    </div>
  );
};
