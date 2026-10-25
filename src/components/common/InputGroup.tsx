import { useId } from 'react';
import { cn } from '@/utils';

interface InputGroupProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  tip?: string;
  error?: string;
  /** 저장을 막지 않는 경고. 빨강은 "고쳐야 넘어간다"로 읽혀서 호박색을 쓴다. */
  warning?: string;
}

export const InputGroup = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  tip,
  error,
  warning,
}: InputGroupProps) => {
  const inputId = useId();
  const messageId = `${inputId}-message`;

  return (
    <div className="mb-1">
      <label
        htmlFor={inputId}
        className="text-text-muted mb-2 block text-sm font-semibold"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={error || warning || tip ? messageId : undefined}
        // 경고엔 aria-invalid를 안 붙인다. 다시 누르면 그대로 저장되는 값이다.
        aria-invalid={error ? true : undefined}
        className={cn(
          'border-border-main bg-bg-main text-text-main mb-1 w-full rounded-lg border px-4 py-3 text-[15px] transition-all duration-200 outline-none',
          'placeholder:text-text-muted/70',
          'focus:border-primary focus:ring-primary/20 focus:ring-2',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          !error &&
            warning &&
            'border-amber-400 focus:border-amber-400 focus:ring-amber-400/20',
        )}
      />
      {/* 하나만 띄운다: 에러 > 경고 > 안내 */}
      <div className="flex min-h-4.5 items-start">
        {error ? (
          <p id={messageId} className="text-danger m-0 text-xs font-bold">
            {error}
          </p>
        ) : warning ? (
          <p id={messageId} className="m-0 text-xs font-bold text-amber-400">
            {warning}
          </p>
        ) : (
          tip && (
            <p id={messageId} className="m-0 text-xs text-sky-400">
              {tip}
            </p>
          )
        )}
      </div>
    </div>
  );
};
