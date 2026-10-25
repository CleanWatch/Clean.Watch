import { cn } from '@/utils';
import { Turnstile } from 'react-turnstile';
import { TURNSTILE_SITE_KEY } from '@/constants';

// 로그인 폼과 캡챠 토큰을 따로 둔다. 공유하면 모달에서 푼 캡챠가 로그인 관문을 연다.
interface ModalStateType {
  isOpen: boolean;
  email: string;
  isResetting: boolean;
  error: string;
  captchaToken: string | null;
  captchaKey: number;
}

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

        {/* 안내 문구와 별개로 스크린리더용 라벨을 연결한다 */}
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
          {/* 토큰이 1회용이라 key를 바꿔 새로 받는다 */}
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
            // 빈 칸만 잠근다. 형식 오류는 눌렀을 때 알린다.
            disabled={
              modalState.isResetting ||
              !modalState.captchaToken ||
              !modalState.email.trim()
            }
            className={cn(
              'bg-primary hover:bg-primary-hover flex-1 rounded-lg py-3 font-bold text-white transition-all',
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
