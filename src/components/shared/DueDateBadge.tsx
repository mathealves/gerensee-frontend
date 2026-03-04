import { cn } from '@/lib/utils';

interface DueDateBadgeProps {
  dueDate: string;
  className?: string;
}

export function DueDateBadge({ dueDate, className }: DueDateBadgeProps) {
  const date = new Date(dueDate);
  const isPastDue = date < new Date();

  const formatted = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
        isPastDue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600',
        className,
      )}
    >
      {formatted}
    </span>
  );
}
