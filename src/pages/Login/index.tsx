/* src/pages/Login/index.tsx */

import { cn } from '@/utils';
import { Link } from 'react-router-dom';
import { Turnstile } from 'react-turnstile';
import { handleDiscordLogin } from '@/hooks';
import { useLoginForm, useDiscordCallback } from './hooks';
import { PasswordResetModal } from './components';
import { LoadingSpinner } from '@/components';
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
    <div className="flex grow items-center justify-center p-5">
      <div
        className={cn(
          'w-full max-w-105 p-10',
          'border-border-main bg-bg-card rounded-2xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]',
          'text-text-main',
        )}
      >
        <h1 className="mb-8 text-center text-[28px] font-extrabold tracking-tight">
          로그인
        </h1>

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
              className={cn(
                'text-text-main w-full rounded-lg px-4 py-3 text-[15px] transition-all outline-none',
                'border-border-main bg-bg-main border',
                'focus:border-primary focus:bg-bg-card focus:ring-primary focus:ring-2',
              )}
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
              className={cn(
                'text-text-main w-full rounded-lg px-4 py-3 text-[15px] transition-all outline-none',
                'border-border-main bg-bg-main border',
                'focus:border-primary focus:bg-bg-card focus:ring-primary focus:ring-2',
              )}
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
              {/* key가 바뀌면 위젯이 새로 마운트되어 새 토큰을 받습니다.
                  Turnstile 토큰은 1회용이라 로그인 시도마다 새로 필요합니다. */}
              <Turnstile
                key={uiState.captchaKey}
                sitekey={TURNSTILE_SITE_KEY}
                onVerify={handleCaptchaVerify}
                onExpire={handleCaptchaExpire}
              />
            </div>
          )}

          {(error || uiState.localError || discordError) && (
            <p className="mb-4 text-center text-[13px] font-medium text-[#ff4757]">
              {uiState.localError || discordError || errorMessage}
            </p>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isPending || (needsCaptcha && !uiState.captchaToken)}
            className={cn(
              'mt-1 w-full rounded-lg py-3.5 text-[16px] font-bold transition-all duration-200',
              'bg-bg-main border-border-main text-text-muted border',
              'hover:border-primary hover:text-primary hover:-translate-y-px',
              'active:scale-[0.98]',
              'disabled:transform-none disabled:bg-gray-400 disabled:text-white',
            )}
          >
            {isPending ? '로그인 중...' : '로그인'}
          </button>

          {/*  디스코드 버튼 */}
          <button
            type="button"
            disabled={isPending}
            onClick={handleDiscordLogin}
            className={cn(
              'mt-4 mb-6 w-full rounded-lg py-3.5 text-[15px] font-bold text-white transition-all duration-200',
              'bg-discord shadow-[0_4px_12px_rgba(88,101,242,0.2)]',
              'hover:-translate-y-px hover:brightness-90',
              'active:scale-[0.98]',
            )}
          >
            Discord 소셜 로그인
          </button>

          <div className="text-text-muted mt-5 flex items-center justify-center gap-3 text-[13px] font-medium">
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
      {/* 비밀번호 찾기 모달창 */}
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
