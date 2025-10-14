import { Badge } from '@/components/ui/badge';
import { RunStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RunStatus;
  className?: string;
}

const statusConfig: Record<RunStatus, { label: string; className: string }> = {
  queued: { label: 'Queued', className: 'bg-status-queued/10 text-status-queued border-status-queued/20' },
  running: { label: 'Running', className: 'bg-status-running/10 text-status-running border-status-running/20' },
  succeeded: { label: 'Succeeded', className: 'bg-status-succeeded/10 text-status-succeeded border-status-succeeded/20' },
  failed: { label: 'Failed', className: 'bg-status-failed/10 text-status-failed border-status-failed/20' },
  cancelled: { label: 'Cancelled', className: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20' },
  timeout: { label: 'Timeout', className: 'bg-status-timeout/10 text-status-timeout border-status-timeout/20' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
