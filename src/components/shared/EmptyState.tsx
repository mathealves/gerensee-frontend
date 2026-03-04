import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  heading: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  heading,
  description,
  ctaLabel,
  onCta,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{heading}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {ctaLabel && onCta && (
        <Button className="mt-4" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
