/* src/pages/Login/PasswordResetModal.tsx */

import { cn } from '@/utils';
import { Turnstile } from 'react-turnstile';
import { TURNSTILE_SITE_KEY } from '@/constants';

// 모달 상태 설계도
//
// 캡챠 토큰을 여기에 둡니다. 예전에는 로그인 폼의 uiState.turnstileToken을
// 같이 썼는데, 그러면 모달에서 캡챠를 풀고 닫는 것만으로 로그인 폼의
// 관문이 열려 있었습니다.
interface ModalStateType {
  isOpen: boolean;
  email: string;
  isResetting: boolean;
  error: string;
  captchaToken: string | null;
  captchaKey: number;
}

// 부모(로그인페이지)에서 넘겨줄 프롭스의 타입 선언
interface ModalProps {
  modalState: ModalStateType;
  setModalState: React.Dispatch<React.SetStateAction<ModalStateType>>;
  onCaptchaVerify: (token: string) => void;
  onCaptchaExpire: () => void;
  handlePasswordReset: () => void;
}

export const PasswordResetModal = ({
  modalState,
  setModalState,
  onCaptchaVerify,
  onCaptchaExpire,
  handlePasswordReset,
}: ModalProps) => {
  // 모달이 닫혀있으면 화면에 아무것도 안 그림 (return null)
  if (!modalState.isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm',
      )}
      onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
    >
      <div
        className={cn(
          'flex w-full max-w-100 flex-col rounded-2xl p-6 sm:p-8',
          'border-border-main bg-bg-card text-text-main border shadow-[0_10px_40px_rgba(0,0,0,0.5)]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-[20px] font-bold">비밀번호 찾기</h2>
        <p className="text-text-muted mb-6 text-[13px] leading-relaxed">
          가입하신 이메일 주소를 입력하시면,
          <br />
          비밀번호 재설정 링크를 보내드립니다.
        </p>

        {/* 시각적으로는 위 안내 문구가 라벨 역할을 하지만, 스크린리더는
            <label>이 연결되어 있지 않으면 무슨 칸인지 알 수 없습니다. */}
        <label htmlFor="reset-email" className="sr-only">
          가입한 이메일 주소
        </label>
        <input
          id="reset-email"
          type="email"
          value={modalState.email}
          onChange={(e) =>
            setModalState((prev) => ({
              ...prev,
              email: e.target.value,
              error: '',
            }))
          }
          placeholder="가입한 이메일 입력"
          className={cn(
            'mb-4 w-full rounded-lg px-4 py-3 text-[15px] transition-all outline-none',
            'border-border-main bg-bg-main border',
            'focus:border-primary focus:bg-bg-card focus:ring-primary focus:ring-2',
          )}
        />
        {modalState.error && (
          <p className="text-danger mb-4 text-center text-[13px] font-medium">
            {modalState.error}
          </p>
        )}

        <div className="mb-4 flex min-h-16.25 justify-center">
          {/* key가 바뀌면 위젯이 새로 마운트되어 새 토큰을 받습니다.
              Turnstile 토큰은 1회용이라 한 번 보내고 나면 재사용할 수 없습니다. */}
          <Turnstile
            key={modalState.captchaKey}
            sitekey={TURNSTILE_SITE_KEY}
            onVerify={onCaptchaVerify}
            onExpire={onCaptchaExpire}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePasswordReset}
            // 이메일이 비어 있으면 보낼 것이 없으므로 잠급니다.
            // 형식 오류는 눌렀을 때 문구로 알려주지만(타이핑 중에 버튼이
            // 깜빡이면 불편하므로), 빈 칸은 "입력 중"이 아니라 "보낼 게 없음"입니다.
            // 캡챠 미완료로 이미 잠그고 있는 것과 같은 성격입니다.
            disabled={
              modalState.isResetting ||
              !modalState.captchaToken ||
              !modalState.email.trim()
            }
            className={cn(
              'bg-primary hover:bg-primary-hover flex-1 rounded-lg py-3 font-bold text-white transition-all',
              // 잠긴 동안 색이 그대로면 눌러도 되는 것처럼 보입니다.
              'disabled:hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {modalState.isResetting ? '발송 중...' : '이메일 받기'}
          </button>
          <button
            onClick={() =>
              setModalState((prev) => ({ ...prev, isOpen: false }))
            }
            className={cn(
              'border-border-main text-text-muted hover:bg-bg-main flex-1 rounded-lg border bg-transparent py-3 font-bold transition-all',
            )}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
