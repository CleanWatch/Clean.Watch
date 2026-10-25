import { useState, useCallback } from 'react';

export const useCopyToClipboard = (resetInterval = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);

        setTimeout(() => setIsCopied(false), resetInterval);
      } catch (error) {
        console.error('클립보드 복사 실패:', error);
        setIsCopied(false);
      }
    },
    [resetInterval],
  );

  return { isCopied, copyToClipboard };
};
