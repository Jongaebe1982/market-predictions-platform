import { cn } from '@/lib/utils';

interface ComingSoonBadgeProps {
  label?: string;
  className?: string;
}

export function ComingSoonBadge({ label = 'Coming in Pro', className }: ComingSoonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500',
        className
      )}
    >
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </span>
  );
}

interface ProFeatureButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function ProFeatureButton({ children, className }: ProFeatureButtonProps) {
  return (
    <div className={cn('relative', className)}>
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
      >
        {children}
      </button>
      <ComingSoonBadge className="absolute -top-2 -right-2 text-[10px]" />
    </div>
  );
}
