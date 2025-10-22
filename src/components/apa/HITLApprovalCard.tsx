import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Shield,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HITLRequest {
  id: string;
  run_id: string;
  agent_id: string;
  request_type: string;
  reason: string;
  action_details: {
    type: string;
    description?: string;
    parameters?: Record<string, any>;
  };
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
}

interface HITLApprovalCardProps {
  request: HITLRequest;
  onApprove?: (requestId: string, feedback?: string) => void;
  onReject?: (requestId: string, feedback?: string) => void;
  className?: string;
}

const riskLevelConfig = {
  low: {
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: Info,
    label: 'Low Risk',
  },
  medium: {
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: AlertTriangle,
    label: 'Medium Risk',
  },
  high: {
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    icon: Shield,
    label: 'High Risk',
  },
  critical: {
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: AlertTriangle,
    label: 'Critical Risk',
  },
};

export function HITLApprovalCard({ 
  request, 
  onApprove, 
  onReject,
  className 
}: HITLApprovalCardProps) {
  const [feedback, setFeedback] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const riskConfig = riskLevelConfig[request.risk_level];
  const RiskIcon = riskConfig.icon;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove?.(request.id, feedback);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject?.(request.id, feedback);
    } finally {
      setIsRejecting(false);
    }
  };

  const timeSinceRequest = () => {
    const now = new Date();
    const requested = new Date(request.requested_at);
    const diffMs = now.getTime() - requested.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className={cn('border-l-4', riskConfig.color)}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <RiskIcon className="h-5 w-5" />
              {request.request_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Requested {timeSinceRequest()}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge 
              variant={request.status === 'pending' ? 'secondary' : 'default'}
              className="capitalize"
            >
              {request.status}
            </Badge>
            <Badge variant="outline" className={cn('capitalize', riskConfig.color)}>
              {riskConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {/* Reason */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Reason for Approval</Label>
          <p className="text-sm text-muted-foreground">
            {request.reason}
          </p>
        </div>

        {/* Action Details */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Action Details</Label>
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Type:</span>
              <Badge variant="outline">{request.action_details.type}</Badge>
            </div>
            {request.action_details.description && (
              <p className="text-sm">{request.action_details.description}</p>
            )}
            {request.action_details.parameters && Object.keys(request.action_details.parameters).length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-medium text-muted-foreground">Parameters:</span>
                <pre className="mt-1 text-xs bg-background p-2 rounded overflow-x-auto">
                  {JSON.stringify(request.action_details.parameters, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Input */}
        {request.status === 'pending' && (
          <div className="space-y-2">
            <Label htmlFor={`feedback-${request.id}`}>
              Feedback (Optional)
            </Label>
            <Textarea
              id={`feedback-${request.id}`}
              placeholder="Provide feedback or reasoning for your decision..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </CardContent>

      {request.status === 'pending' && (
        <CardFooter className="flex gap-2 bg-muted/30">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleReject}
            disabled={isApproving || isRejecting}
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
