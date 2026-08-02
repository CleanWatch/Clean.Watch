import { Turnstile } from 'react-turnstile';
import { cn } from '@/utils';
import { useRegisterForm } from './hooks';
import { InputGroup } from '@/components';
import { TURNSTILE_SITE_KEY } from '@/constants';

// 메인 페이지 컴포넌트: Register
export const Register = () => {
  // 비즈니스 로직은 훅에 위임
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    setCaptchaToken,
    captchaKey,
    isRegistering,
    isChecking,
  } = useRegisterForm();

  return (
    <div className="flex flex-1 items-center justify-center p-5">
      <div className="border-border-main bg-bg-card text-text-main w-full max-w-105 rounded-2xl border p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
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
            placeholder="트레이서#1234"
            value={formData.battletag}
            onChange={(val) => handleChange('battletag', val)}
            tip="💡 가입 후 마이페이지에서도 등록/수정할 수 있습니다."
            error={errors.battletag}
          />

          <div className="mt-4 mb-5 flex justify-center">
            {/* key가 바뀌면 위젯이 새로 마운트되어 새 토큰을 받습니다.
                Turnstile 토큰은 1회용이라 거절된 뒤 재시도하려면 필요합니다. */}
            <Turnstile
              key={captchaKey}
              sitekey={TURNSTILE_SITE_KEY}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>

          <button
            type="submit"
            disabled={isRegistering || isChecking}
            className={cn(
              'bg-primary mt-2.5 w-full rounded-lg p-3.5 text-base font-bold text-white shadow-[0_4px_12px_rgba(255,136,0,0.2)] transition-all duration-200',
              'hover:brightness-110 active:-translate-y-px',
              'disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:brightness-100 active:disabled:translate-y-0',
            )}
          >
            {isRegistering || isChecking ? '가입 처리 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
};
