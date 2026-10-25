interface LoadingSpinnerProps {
  text?: string;
}

export const LoadingSpinner = ({
  text = '데이터를 불러오는 중...',
}: LoadingSpinnerProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="border-primary/20 border-t-primary mb-5 h-15 w-15 animate-spin rounded-full border-[6px]" />

      {text && (
        <h2 className="text-primary m-0 text-center text-lg font-bold">
          {text}
        </h2>
      )}
    </div>
  );
};
