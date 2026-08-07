/* src/hooks/useReport.ts */

import { useState, type SyntheticEvent } from 'react';
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

    // 검증을 통과하면 에러 메시지 지우고 API 호출
    setLocalError('');
    mutation.mutate();
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
