import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Zap, Eye, Lightbulb, Clock, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReasoningStep {
  id: string;
  step_index: number;
  thought: string;
  action: {
    type: string;
    description?: string;
    parameters?: Record<string, any>;
    result?: any;
  };
  observation: {
    status?: string;
    result?: any;
    error?: string;
  };
  reflection?: string;
  tokens_used?: number;
  latency_ms?: number;
  created_at: string;
}

interface ReasoningTraceViewerProps {
  traces: ReasoningStep[];
  className?: string;
}

export function ReasoningTraceViewer({ traces, className }: ReasoningTraceViewerProps) {
  const totalTokens = traces.reduce((sum, trace) => sum + (trace.tokens_used || 0), 0);
  const totalLatency = traces.reduce((sum, trace) => sum + (trace.latency_ms || 0), 0);
  const avgLatency = traces.length > 0 ? Math.round(totalLatency / traces.length) : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{traces.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Coins className="h-4 w-4" />
              Tokens Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Avg Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLatency}ms</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalLatency / 1000).toFixed(2)}s</div>
          </CardContent>
        </Card>
      </div>

      {/* Reasoning Steps */}
      <div className="space-y-3">
        {traces.map((trace, index) => (
          <Card key={trace.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    Step {trace.step_index + 1}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(trace.created_at).toLocaleTimeString()}
                  </span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {trace.tokens_used && (
                    <Badge variant="secondary" className="gap-1">
                      <Coins className="h-3 w-3" />
                      {trace.tokens_used}
                    </Badge>
                  )}
                  {trace.latency_ms && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {trace.latency_ms}ms
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-4">
              {/* Thought */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <span>Thought</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {trace.thought || 'No reasoning recorded'}
                </p>
              </div>

              <Separator />

              {/* Action */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Action</span>
                  <Badge variant="outline" className="ml-2">
                    {trace.action.type}
                  </Badge>
                </div>
                {trace.action.description && (
                  <p className="text-sm text-muted-foreground pl-6">
                    {trace.action.description}
                  </p>
                )}
                {trace.action.parameters && Object.keys(trace.action.parameters).length > 0 && (
                  <div className="pl-6">
                    <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                      {JSON.stringify(trace.action.parameters, null, 2)}
                    </code>
                  </div>
                )}
              </div>

              <Separator />

              {/* Observation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span>Observation</span>
                  {trace.observation.status && (
                    <Badge 
                      variant={trace.observation.status === 'success' ? 'default' : 'destructive'}
                      className="ml-2"
                    >
                      {trace.observation.status}
                    </Badge>
                  )}
                </div>
                {trace.observation.error ? (
                  <p className="text-sm text-destructive pl-6">{trace.observation.error}</p>
                ) : (
                  <div className="pl-6">
                    <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                      {JSON.stringify(trace.observation.result || trace.observation, null, 2)}
                    </code>
                  </div>
                )}
              </div>

              {/* Reflection */}
              {trace.reflection && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Lightbulb className="h-4 w-4 text-purple-500" />
                      <span>Reflection</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{trace.reflection}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {traces.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No Reasoning Traces</CardTitle>
            <CardDescription>
              Execute an agent task to see the reasoning process
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
