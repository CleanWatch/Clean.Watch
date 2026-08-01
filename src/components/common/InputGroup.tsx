/* src/components/common/InputGroup.tsx */

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
}

export const InputGroup = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  tip,
  error,
}: InputGroupProps) => {
  // 재사용 컴포넌트라 인스턴스마다 고유한 id가 필요합니다.
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
        // 에러·안내 문구를 입력 칸과 연결해 스크린리더가 함께 읽도록 합니다.
        aria-describedby={error || tip ? messageId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          'border-border-main bg-bg-main text-text-main mb-1 w-full rounded-lg border px-4 py-3 text-[15px] transition-all duration-200 outline-none',
          'placeholder:text-text-muted/70',
          'focus:border-primary focus:ring-primary/20 focus:ring-2',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        )}
      />
      <div className="flex min-h-4.5 items-start">
        {error ? (
          <p id={messageId} className="m-0 text-xs font-bold text-red-500">
            {' '}
            {error}
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
