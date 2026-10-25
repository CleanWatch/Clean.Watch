import { PageHeader } from '@/components';
import { BATTLETAG_PLACEHOLDER, FIELD, cn } from '@/utils';
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
    <div className="mx-auto w-full max-w-300 grow px-5 sm:px-10">
      <PageHeader
        title="핵 사용자 신고"
        description="신고한 사람 수가 공개 신고 횟수로 집계됩니다. 같은 배틀태그는 24시간에 한 번 다시 신고할 수 있습니다."
      />

      <form
        onSubmit={submitReport}
        noValidate // 브라우저 기본 말풍선 툴팁 끄기
        className="max-w-120 pb-16 sm:pb-24"
      >
        <div className="flex flex-col gap-5">
          <label htmlFor="report-battletag" className="sr-only">
            신고할 배틀태그
          </label>
          <input
            id="report-battletag"
            type="text"
            placeholder={BATTLETAG_PLACEHOLDER}
            value={battleTag}
            onChange={(e) => {
              setBattleTag(e.target.value);
              setLocalError('');
            }}
            className={cn(FIELD, 'p-4 text-[16px]')}
          />

          <select
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setLocalError('');
            }}
            className={cn(
              FIELD,
              'appearance-none p-4 text-[16px]',
              reason === '' ? 'text-text-muted' : 'text-text-main',
            )}
          >
            <option value="" disabled>
              신고 사유 선택 (필수)
            </option>
            <option value="비인가 프로그램">비인가 프로그램</option>
            <option value="고의적 게임 진행 방해 (패작/트롤링)">
              고의적 게임 진행 방해 (패작/트롤링)
            </option>
            <option value="부적절한 의사소통 (욕설/비하)">
              부적절한 의사소통 (욕설/비하)
            </option>
            <option value="기타 사유">기타 사유</option>
          </select>

          <textarea
            placeholder="비인가 프로그램 사용 정황이나 발생 시간 등 세부사항을 적어주세요.(리플레이 코드 등)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className={cn(FIELD, 'min-h-30 resize-none p-4 text-[16px]')}
          ></textarea>

          {localError && (
            <p className="text-danger mt-1 text-center text-[13px] font-medium">
              {localError}
            </p>
          )}

          <button
            type="submit"
            // 빈 칸만 잠근다. 형식 오류는 눌렀을 때 알린다 (타이핑 중 깜빡임 방지).
            disabled={isSubmitting || !battleTag.trim() || !reason}
            className={cn(
              'text-bg-main mt-2 flex h-14 w-full items-center justify-center rounded-lg text-[16px] font-bold transition-all duration-200',
              'bg-danger hover:bg-danger-hover active:scale-[0.98]',
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
