/**
 * Telemetry Dashboard
 * LangWatch integration display with trace visualization
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Clock,
  DollarSign,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TelemetryMetrics {
  totalCalls: number;
  avgLatency: number;
  totalCost: number;
  successRate: number;
  errorRate: number;
  p95Latency: number;
  p99Latency: number;
  tokensUsed: number;
}

interface Trace {
  id: string;
  name: string;
  timestamp: string;
  duration: number;
  status: 'success' | 'error';
  spans: TraceSpan[];
}

interface TraceSpan {
  id: string;
  name: string;
  type: 'llm' | 'tool' | 'retrieval';
  duration: number;
  tokens?: { input: number; output: number };
  cost?: number;
}

interface EvaluationMetric {
  name: string;
  score: number;
  threshold: number;
  status: 'pass' | 'fail' | 'warning';
}

interface TelemetryDashboardProps {
  metrics: TelemetryMetrics;
  traces?: Trace[];
  evaluations?: EvaluationMetric[];
  className?: string;
}

/**
 * Telemetry Dashboard Component
 */
export function TelemetryDashboard({
  metrics,
  traces = [],
  evaluations = [],
  className,
}: TelemetryDashboardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">LLM invocations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgLatency}ms</div>
            <div className="flex items-center gap-2 mt-1">
              <TrendingDown className="h-3 w-3 text-success" />
              <p className="text-xs text-success">-12% from last hour</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.tokensUsed.toLocaleString()} tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.successRate * 100).toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <p className="text-xs text-success">+2.3% improvement</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="traces" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="traces">Traces</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Traces Tab */}
        <TabsContent value="traces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Traces</CardTitle>
              <CardDescription>Last 10 LLM calls with detailed spans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {traces.map((trace) => (
                  <div
                    key={trace.id}
                    className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={trace.status === 'success' ? 'default' : 'destructive'}
                        >
                          {trace.status}
                        </Badge>
                        <span className="font-medium">{trace.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(trace.timestamp).toLocaleTimeString()} •{' '}
                        {trace.duration}ms
                      </div>
                    </div>

                    {/* Spans */}
                    <div className="space-y-2">
                      {trace.spans.map((span) => (
                        <div key={span.id} className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="text-xs">
                                {span.type}
                              </Badge>
                              <span>{span.name}</span>
                            </div>
                            <Progress
                              value={(span.duration / trace.duration) * 100}
                              className="h-1 mt-1"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground w-20 text-right">
                            {span.duration}ms
                          </div>
                          {span.tokens && (
                            <div className="text-xs text-muted-foreground w-24 text-right">
                              {span.tokens.input + span.tokens.output} tokens
                            </div>
                          )}
                          {span.cost && (
                            <div className="text-xs text-muted-foreground w-16 text-right">
                              ${span.cost.toFixed(4)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluations Tab */}
        <TabsContent value="evaluations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Evaluations</CardTitle>
              <CardDescription>AI output quality metrics and scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluations.map((evaluation) => (
                  <div key={evaluation.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{evaluation.name}</span>
                        {evaluation.status === 'fail' && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {(evaluation.score * 100).toFixed(1)}%
                        </span>
                        <Badge
                          variant={
                            evaluation.status === 'pass'
                              ? 'default'
                              : evaluation.status === 'fail'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {evaluation.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={evaluation.score * 100} className="h-2" />
                      <div
                        className="absolute top-0 w-0.5 h-4 bg-border"
                        style={{ left: `${evaluation.threshold * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Score: {(evaluation.score * 100).toFixed(1)}%</span>
                      <span>Threshold: {(evaluation.threshold * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Latency Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average</span>
                    <span className="font-medium">{metrics.avgLatency}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">P95</span>
                    <span className="font-medium">{metrics.p95Latency}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">P99</span>
                    <span className="font-medium">{metrics.p99Latency}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium text-success">
                      {(metrics.successRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-medium text-destructive">
                      {(metrics.errorRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.successRate * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
