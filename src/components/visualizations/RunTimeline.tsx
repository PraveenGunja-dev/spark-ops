/**
 * Run Timeline Viewer
 * Visual representation of workflow execution steps
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RunStep } from '@/lib/types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  MessageSquare,
  GitBranch,
  IterationCw,
  Webhook
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RunTimelineProps {
  steps: RunStep[];
  className?: string;
}

const STEP_ICONS = {
  tool: Zap,
  prompt: MessageSquare,
  decision: GitBranch,
  loop: IterationCw,
  webhook: Webhook,
  human: Clock,
};

/**
 * Run Timeline Component
 * Displays execution flow with visual timeline
 */
export function RunTimeline({ steps, className }: RunTimelineProps) {
  const totalDuration = steps.reduce((sum, step) => sum + step.durationMs, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Execution Timeline</span>
          <Badge variant="outline">
            {steps.length} steps • {(totalDuration / 1000).toFixed(2)}s
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[step.type] || Zap;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Timeline Line */}
                {!isLast && (
                  <div className="absolute left-[15px] top-[40px] bottom-[-16px] w-0.5 bg-border" />
                )}

                {/* Step Card */}
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      step.success
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{step.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {step.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Step {index + 1} of {steps.length}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {step.success ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="text-sm font-medium">
                            {(step.durationMs / 1000).toFixed(2)}s
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(step.startedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {!step.success && step.errorMessage && (
                      <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{step.errorMessage}</p>
                      </div>
                    )}

                    {/* Request/Response Preview */}
                    {(step.request || step.response) && (
                      <details className="mt-3">
                        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                          View details
                        </summary>
                        <div className="mt-2 space-y-2">
                          {step.request && (
                            <div>
                              <div className="text-xs font-medium mb-1">Request:</div>
                              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(step.request, null, 2)}
                              </pre>
                            </div>
                          )}
                          {step.response && (
                            <div>
                              <div className="text-xs font-medium mb-1">Response:</div>
                              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(step.response, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}

                    {/* Duration Bar */}
                    <div className="mt-3">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            step.success ? 'bg-success' : 'bg-destructive'
                          )}
                          style={{
                            width: `${(step.durationMs / totalDuration) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">
                {steps.filter((s) => s.success).length}
              </div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">
                {steps.filter((s) => !s.success).length}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {(totalDuration / 1000).toFixed(2)}s
              </div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
