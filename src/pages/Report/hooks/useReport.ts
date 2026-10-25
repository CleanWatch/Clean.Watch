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

  const [battleTag, setBattleTag] = useState('');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const [localError, setLocalError] = useState('');

  // state가 아니라 ref. 같은 틱에 두 번 호출되면 state는 아직 false라 둘 다 통과한다.
  const inFlight = useRef(false);

  const mutation = useMutation({
    mutationFn: async () => {
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
      if (error instanceof AlreadyReportedRecentlyError) {
        // 언제 풀리는지 알려 준다
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

  const submitReport = (e?: SyntheticEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    if (!uid) return setLocalError('로그인이 필요합니다.');
    if (!battleTag.trim()) return setLocalError('배틀태그를 입력해 주세요.');
    if (!isValidBattletag(battleTag))
      return setLocalError(BATTLETAG_FORMAT_ERROR);
    if (!reason) return setLocalError('신고 사유를 선택해 주세요.');

    // 검증 통과 후에 잠근다. 형식 오류로 돌아간 경우까지 잠그면 다시 못 누른다.
    if (inFlight.current) return;
    inFlight.current = true;

    setLocalError('');
    // onSettled라 성공·실패 모두 플래그가 풀린다
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
