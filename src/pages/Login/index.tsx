import { FIELD, cn } from '@/utils';
import { Link } from 'react-router-dom';
import { Turnstile } from 'react-turnstile';
import { handleDiscordLogin } from '@/hooks';
import { useLoginForm, useDiscordCallback } from './hooks';
import { PasswordResetModal } from './components';
import { LoadingSpinner, PageHeader } from '@/components';
import { TURNSTILE_SITE_KEY } from '@/constants';

export const Login = () => {
  const {
    isPending,
    error,
    errorMessage,
    formData,
    setFormData,
    uiState,
    setUiState,
    needsCaptcha,
    handleCaptchaVerify,
    handleCaptchaExpire,
    handleModalCaptchaVerify,
    handleModalCaptchaExpire,
    modalState,
    setModalState,
    onSubmit,
    handlePasswordReset,
  } = useLoginForm();
  const { isExchanging, error: discordError } = useDiscordCallback();

  if (isExchanging) return <LoadingSpinner />;

  return (
    <div className="mx-auto w-full max-w-300 grow px-5 sm:px-10">
      <PageHeader
        title="로그인"
        description="이메일 또는 Discord 계정으로 로그인합니다."
      />

      <div className="text-text-main max-w-110 pb-16 sm:pb-24">
        <form onSubmit={onSubmit} noValidate>
          <div className="mb-5">
            <label
              htmlFor="login-email"
              className="text-text-muted mb-2 block text-[14px] font-semibold"
            >
              이메일
            </label>
            <input
              id="login-email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                setUiState((prev) => ({ ...prev, localError: '' }));
              }}
              placeholder="example@email.com"
              disabled={isPending}
              className={FIELD}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="login-password"
              className="text-text-muted mb-2 block text-[14px] font-semibold"
            >
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                setUiState((prev) => ({ ...prev, localError: '' }));
              }}
              placeholder="비밀번호 입력"
              disabled={isPending}
              className={FIELD}
            />
          </div>

          <div className="mb-5 flex items-center justify-between">
            <label className="group flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.keepLoggedIn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    keepLoggedIn: e.target.checked,
                  }))
                }
                className="border-border-main text-primary accent-primary focus:ring-primary h-4 w-4 cursor-pointer rounded"
              />
              <span className="text-text-muted group-hover:text-text-main ml-2 text-[13px] select-none">
                로그인 상태 유지
              </span>
            </label>
            <label className="group flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.rememberEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rememberEmail: e.target.checked,
                  }))
                }
                className="border-border-main text-primary accent-primary focus:ring-primary h-4 w-4 cursor-pointer rounded"
              />
              <span className="text-text-muted group-hover:text-text-main ml-2 text-[13px] select-none">
                이메일 저장
              </span>
            </label>
          </div>

          {needsCaptcha && (
            <div className="mb-4 flex min-h-16.25 justify-center">
              {/* 토큰이 1회용이라 시도마다 key를 바꿔 새로 받는다 */}
              <Turnstile
                key={uiState.captchaKey}
                sitekey={TURNSTILE_SITE_KEY}
                onVerify={handleCaptchaVerify}
                onExpire={handleCaptchaExpire}
              />
            </div>
          )}

          {(error || uiState.localError || discordError) && (
            <p className="text-danger mb-4 text-center text-[13px] font-medium">
              {uiState.localError || discordError || errorMessage}
            </p>
          )}

          <button
            type="submit"
            // 빈 칸만 잠근다. 형식 오류는 눌렀을 때 알린다 (타이핑 중 깜빡임 방지).
            disabled={
              isPending ||
              (needsCaptcha && !uiState.captchaToken) ||
              !formData.email.trim() ||
              !formData.password
            }
            className={cn(
              'mt-1 w-full rounded-lg py-3.5 text-[16px] font-bold transition-all duration-200',
              'bg-primary hover:bg-primary-hover text-bg-main',
              'active:scale-[0.98]',
              'disabled:hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isPending ? '로그인 중...' : '로그인'}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleDiscordLogin}
            className={cn(
              'mt-4 mb-3 w-full rounded-lg py-3.5 text-[15px] font-bold text-white transition-all duration-200',
              'bg-discord shadow-[0_4px_12px_rgba(88,101,242,0.2)]',
              'hover:-translate-y-px hover:brightness-90',
              'active:scale-[0.98]',
            )}
          >
            Discord 소셜 로그인
          </button>

          {/* 디스코드 첫 로그인은 가입 폼을 거치지 않아 동의를 여기서 고지한다 */}
          <p className="text-text-muted mb-6 text-[12px] leading-relaxed">
            디스코드로 처음 로그인하면 계정이 생성되며,{' '}
            <Link
              to="/terms"
              target="_blank"
              className="text-text-muted hover:text-primary underline decoration-dotted underline-offset-2 transition-colors"
            >
              이용약관
            </Link>
            과{' '}
            <Link
              to="/privacy"
              target="_blank"
              className="text-text-muted hover:text-primary underline decoration-dotted underline-offset-2 transition-colors"
            >
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주합니다.
          </p>

          <div className="text-text-muted mt-5 flex items-center gap-3 text-[13px] font-medium">
            <Link
              to="/register"
              className="hover:text-primary transition-colors hover:underline"
            >
              회원가입
            </Link>
            <span className="text-border-main">|</span>
            <button
              type="button"
              onClick={() =>
                setModalState((prev) => ({ ...prev, isOpen: true }))
              }
              className="hover:text-primary transition-colors hover:underline"
            >
              비밀번호 찾기
            </button>
            <span className="text-border-main">|</span>
            <Link
              to="/"
              className="hover:text-primary transition-colors hover:underline"
            >
              홈으로
            </Link>
          </div>
        </form>
      </div>
      <PasswordResetModal
        modalState={modalState}
        setModalState={setModalState}
        onCaptchaVerify={handleModalCaptchaVerify}
        onCaptchaExpire={handleModalCaptchaExpire}
        handlePasswordReset={handlePasswordReset}
      />
    </div>
  );
};
