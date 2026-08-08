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
  /**
   * 저장을 막지 **않는** 경고. 빨강이 아니라 호박색으로 나갑니다.
   *
   * 빨강은 "고쳐야 넘어간다"는 뜻으로 읽힙니다. 배틀태그 실존 확인처럼
   * "못 찾았지만 그대로 진행할 수 있다"는 상황에 빨강을 쓰면, 사용자는 고칠 수
   * 없는 값(비공개 프로필)을 붙들고 멈춥니다.
   */
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
        aria-describedby={error || warning || tip ? messageId : undefined}
        // 경고에는 붙이지 않습니다. aria-invalid는 "이 값으로는 제출할 수 없다"는
        // 뜻인데, 경고는 다시 누르면 그대로 저장됩니다.
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
      {/* 우선순위: 에러 > 경고 > 안내. 셋을 동시에 띄우면 무엇부터 봐야 할지
          알 수 없고, 세로 높이도 들쭉날쭉해집니다. */}
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
