import { Link } from 'react-router-dom';
import { Turnstile } from 'react-turnstile';
import { BATTLETAG_EXAMPLE, cn } from '@/utils';
import { useRegisterForm } from './hooks';
import { InputGroup } from '@/components';
import { TURNSTILE_SITE_KEY } from '@/constants';

export const Register = () => {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    setCaptchaToken,
    captchaKey,
    isRegistering,
    isChecking,
    isVerifying,
    battletagWarning,
    agreed,
    setAgreed,
  } = useRegisterForm();

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-5">
      <div className="border-border-main bg-bg-card text-text-main w-full max-w-105 rounded-2xl border p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] sm:p-10">
        <h1 className="mb-8 text-center text-[28px] font-extrabold tracking-tight">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <InputGroup
            label="닉네임"
            placeholder="특수문자 제외 2~12자"
            value={formData.username}
            onChange={(val) => handleChange('username', val)}
            error={errors.username}
          />

          <InputGroup
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(val) => handleChange('email', val)}
            error={errors.email}
          />

          <InputGroup
            label="비밀번호"
            type="password"
            placeholder="최소 6자리 이상"
            value={formData.password}
            onChange={(val) => handleChange('password', val)}
            error={errors.password}
          />

          <InputGroup
            label="Battletag (선택)"
            placeholder={BATTLETAG_EXAMPLE}
            value={formData.battletag}
            onChange={(val) => handleChange('battletag', val)}
            tip="가입 후 마이페이지에서도 등록/수정할 수 있습니다."
            error={errors.battletag}
            warning={battletagWarning}
          />

          {/* 캡챠보다 위에 둔다. 통과 후 동의 때문에 막히면 토큰이 낭비된다 */}
          <label className="mt-5 flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="border-border-main text-primary accent-primary focus:ring-primary mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded"
            />
            <span className="text-text-muted text-[13px] leading-relaxed select-none">
              <span className="text-primary font-semibold">(필수)</span> 만 14세
              이상이며,{' '}
              <Link
                to="/terms"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="text-text-main hover:text-primary font-semibold underline decoration-dotted underline-offset-2 transition-colors"
              >
                이용약관
              </Link>
              과{' '}
              <Link
                to="/privacy"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="text-text-main hover:text-primary font-semibold underline decoration-dotted underline-offset-2 transition-colors"
              >
                개인정보처리방침
              </Link>
              에 동의합니다.
            </span>
          </label>

          <div className="mt-4 mb-5 flex justify-center">
            {/* 토큰이 1회용이라 거절되면 key를 바꿔 새로 받는다 */}
            <Turnstile
              key={captchaKey}
              sitekey={TURNSTILE_SITE_KEY}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>

          <button
            type="submit"
            // 빈 칸만 잠근다. 형식 오류는 눌렀을 때 알린다 (타이핑 중 깜빡임 방지).
            disabled={
              isRegistering ||
              isChecking ||
              isVerifying ||
              !formData.username.trim() ||
              !formData.email.trim() ||
              !formData.password ||
              !agreed
            }
            className={cn(
              'bg-primary mt-2.5 w-full rounded-lg p-3.5 text-base font-bold text-white shadow-[0_4px_12px_rgba(255,136,0,0.2)] transition-all duration-200',
              'hover:bg-primary-hover active:-translate-y-px',
              'disabled:hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 active:disabled:translate-y-0',
            )}
          >
            {/* 실존 확인에 3~6초 걸려 문구로 진행 중임을 알린다 */}
            {isVerifying
              ? '배틀태그 확인 중...'
              : isRegistering || isChecking
                ? '가입 처리 중...'
                : battletagWarning
                  ? '확인 없이 가입'
                  : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
};
