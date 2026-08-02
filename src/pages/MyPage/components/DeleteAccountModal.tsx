/* src/pages/MyPage/components/DeleteAccountModal.tsx */

import { useId, useState } from 'react';
import { cn } from '@/utils';

interface DeleteAccountModalProps {
  isOpen: boolean;
  username: string;
  reportCount: number;
  isPending: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteAccountModal = ({
  isOpen,
  username,
  reportCount,
  isPending,
  error,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) => {
  const inputId = useId();

  // 입력값 초기화는 effect가 아니라 부모의 key로 처리합니다.
  // 닫을 때 key가 바뀌어 컴포넌트가 리마운트되므로 typed가 자연히 비워집니다.
  const [typed, setTyped] = useState('');

  if (!isOpen) return null;

  const canDelete = typed === username && !isPending;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm',
      )}
      onClick={isPending ? undefined : onClose}
    >
      <div
        className={cn(
          'flex w-full max-w-100 flex-col rounded-2xl p-8',
          'border-border-main bg-bg-card text-text-main border shadow-[0_10px_40px_rgba(0,0,0,0.5)]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-[20px] font-bold">정말 탈퇴하시겠습니까</h2>
        <p className="text-text-muted mb-6 text-[13px] leading-relaxed">
          프로필과 로그인 정보가 삭제되며 되돌릴 수 없습니다.
          {reportCount > 0 && (
            <>
              <br />
              작성하신 신고{' '}
              <span className="text-text-main font-bold">{reportCount}건</span>
              은 익명으로 남습니다.
            </>
          )}
        </p>

        <label htmlFor={inputId} className="text-text-muted mb-2 text-[13px]">
          확인을 위해{' '}
          <span className="text-text-main font-bold">{username}</span> 을
          입력하세요
        </label>
        <input
          id={inputId}
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="닉네임 입력"
          disabled={isPending}
          autoComplete="off"
          className={cn(
            'mb-4 w-full rounded-lg px-4 py-3 text-[15px] transition-all outline-none',
            'border-border-main bg-bg-main border',
            'focus:border-primary focus:bg-bg-card focus:ring-primary focus:ring-2',
          )}
        />

        {error && (
          <p className="text-danger mb-4 text-center text-[13px] font-medium">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete}
            className={cn(
              'flex-1 rounded-lg border py-3 font-bold transition-all',
              'text-danger border-red-500/30 bg-red-500/10',
              'hover:bg-red-500 hover:text-white',
              'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-red-500/5 disabled:text-red-500/40 disabled:hover:bg-red-500/5',
            )}
          >
            {isPending ? '처리 중...' : '탈퇴하기'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={cn(
              'border-border-main text-text-muted hover:bg-bg-main flex-1 rounded-lg border bg-transparent py-3 font-bold transition-all',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
