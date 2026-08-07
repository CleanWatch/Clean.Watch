/* src/hooks/useReport.ts */

import { useRef, useState, type SyntheticEvent } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import {
  AlreadyReportedRecentlyError,
  BATTLETAG_FORMAT_ERROR,
  formatTimeUntil,
  isValidBattletag,
} from '@/utils';
import { submitNewReport } from '@/api';

export const useReport = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const uid = useAuthStore((state) => state.uid);

  // 폼 로컬 상태 관리
  const [battleTag, setBattleTag] = useState('');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  // UI용 에러 상태
  const [localError, setLocalError] = useState('');

  /**
   * 제출이 진행 중인지. **상태가 아니라 ref인 이유가 핵심입니다.**
   *
   * `mutation.isPending`이나 버튼의 `disabled`는 리렌더가 일어나야 반영되는데,
   * 같은 틱에서 이 함수가 두 번 돌면 둘 다 아직 이전 값(false)을 봅니다.
   * ref는 동기적으로 바뀌므로 두 번째 호출이 곧바로 걸립니다.
   *
   * 서버도 409로 막지만(트랜잭션), 여기서 끊으면 쓸데없는 왕복이 없고
   * 응답 순서가 뒤집혔을 때 엉뚱한 에러가 스치는 일도 없습니다.
   */
  const inFlight = useRef(false);

  // 서버 통신 Mutation (API 호출과 서버 에러 처리만 담당)
  const mutation = useMutation({
    mutationFn: async () => {
      // uid는 서버가 ID 토큰에서 꺼냅니다.
      await submitNewReport(battleTag, reason, details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      if (uid) queryClient.invalidateQueries({ queryKey: ['myReports', uid] });

      toast.success(`${battleTag} 신고가 접수되었습니다`);

      setBattleTag('');
      setReason('');
      setDetails('');
      setLocalError('');
      navigate('/');
    },
    onError: (error: Error) => {
      // API에서 던진 에러(예: 중복 신고)를 잡아서 빨간 글씨로 띄워줌
      if (error instanceof AlreadyReportedRecentlyError) {
        // 막기만 하고 언제 풀리는지 안 알려주면 될 때까지 눌러보게 됩니다.
        setLocalError(
          `이미 신고한 배틀태그입니다. ${formatTimeUntil(error.retryAfterSeconds)} 다시 신고할 수 있습니다.`,
        );
      } else if (error.message === 'ALREADY_REPORTED') {
        setLocalError('이미 신고한 배틀태그입니다.');
      } else {
        console.error('신고 접수 에러:', error);
        setLocalError('신고 접수 중 서버 오류가 발생했습니다.');
      }
    },
  });

  // UI에서 호출할 최종 제출 함수
  const submitReport = (e?: SyntheticEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    // 프론트엔드 레벨 유효성 검사
    if (!uid) return setLocalError('로그인이 필요합니다.');
    if (!battleTag.trim()) return setLocalError('배틀태그를 입력해 주세요.');
    if (!isValidBattletag(battleTag))
      return setLocalError(BATTLETAG_FORMAT_ERROR);
    if (!reason) return setLocalError('신고 사유를 선택해 주세요.');

    // 검증을 다 통과한 뒤에 겁니다. 형식이 틀려 되돌아간 경우까지 잠그면
    // 고쳐서 다시 누를 수 없게 됩니다.
    if (inFlight.current) return;
    inFlight.current = true;

    // 검증을 통과하면 에러 메시지 지우고 API 호출
    setLocalError('');
    // onSettled는 성공·실패 모두에서 돌아 플래그가 갇히지 않습니다.
    mutation.mutate(undefined, {
      onSettled: () => {
        inFlight.current = false;
      },
    });
  };

  return {
    battleTag,
    setBattleTag,
    reason,
    setReason,
    details,
    setDetails,
    localError, // 컴포넌트로 전달
    setLocalError, // 컴포넌트로 전달 (타이핑 시 에러 초기화용)
    submitReport,
    isSubmitting: mutation.isPending,
  };
};
