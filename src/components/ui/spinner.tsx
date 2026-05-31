import { cn } from '@/lib/utils';

type SpinnerProps = {
  className?: string;
};

export function Spinner({ className }: SpinnerProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn('h-5 w-5 animate-spin text-cyan-200', className)}
      fill="none"
    >
      <circle cx="12" cy="12" r="9" className="stroke-current opacity-25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current opacity-80" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
