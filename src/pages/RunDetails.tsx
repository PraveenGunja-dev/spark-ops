import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockRuns, mockRunSteps, mockWorkflows, mockAgents } from '@/lib/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, RefreshCw, X, Play, Clock, DollarSign } from 'lucide-react';

export default function RunDetails() {
  const { id } = useParams<{ id: string }>();
  const run = mockRuns.find(r => r.id === id);

  if (!run) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/runs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Run not found</h1>
        </div>
      </div>
    );
  }

  const workflow = mockWorkflows.find(w => w.id === run.workflowId);
  const agent = mockAgents.find(a => a.id === run.agentId);
  const steps = mockRunSteps.filter(s => s.runId === run.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/runs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-mono">{run.id}</h1>
            <p className="text-muted-foreground">{workflow?.name || 'Unknown workflow'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={run.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {run.usdCost ? `$${run.usdCost.toFixed(2)}` : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {run.tokensPrompt && run.tokensCompletion ? 
                (run.tokensPrompt + run.tokensCompletion).toLocaleString() : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Run Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Workflow</p>
                  <p className="text-sm mt-1">{workflow?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Version</p>
                  <p className="text-sm mt-1">v{run.workflowVersion}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Agent</p>
                  <p className="text-sm mt-1">{agent?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Model</p>
                  <p className="text-sm mt-1">{agent?.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trigger</p>
                  <Badge variant="secondary" className="mt-1">{run.trigger}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Environment</p>
                  <Badge variant="outline" className="mt-1">{run.env}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Region</p>
                  <p className="text-sm mt-1">{run.region}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Retries</p>
                  <p className="text-sm mt-1">{run.retries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {steps.length > 0 ? (
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className={`mt-1 h-2 w-2 rounded-full ${step.success ? 'bg-success' : 'bg-destructive'}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{step.name}</p>
                            <p className="text-sm text-muted-foreground">Step {step.idx} • {step.type}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(step.durationMs / 1000).toFixed(2)}s
                          </div>
                        </div>
                        {step.request && (
                          <details className="mt-2">
                            <summary className="text-sm text-muted-foreground cursor-pointer">Request</summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(step.request, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No steps recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1">
                <p className="text-muted-foreground">[{new Date(run.startedAt).toISOString()}] INFO: Run started</p>
                <p className="text-muted-foreground">[{new Date(run.startedAt).toISOString()}] INFO: Agent initialized: {agent?.name}</p>
                <p className="text-muted-foreground">[{new Date(run.startedAt).toISOString()}] INFO: Workflow loaded: {workflow?.name} v{run.workflowVersion}</p>
                {steps.map((step, i) => (
                  <p key={step.id} className={step.success ? 'text-success' : 'text-destructive'}>
                    [{new Date(step.startedAt).toISOString()}] {step.success ? 'INFO' : 'ERROR'}: Step {step.idx} ({step.name}) {step.success ? 'completed' : 'failed'}
                  </p>
                ))}
                {run.endedAt && (
                  <p className="text-muted-foreground">[{new Date(run.endedAt).toISOString()}] INFO: Run completed with status: {run.status}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Prompt Tokens</p>
                    <p className="text-sm text-muted-foreground">{run.tokensPrompt?.toLocaleString() || 0} tokens</p>
                  </div>
                  <p className="font-mono">${((run.tokensPrompt || 0) * 0.00003).toFixed(4)}</p>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Completion Tokens</p>
                    <p className="text-sm text-muted-foreground">{run.tokensCompletion?.toLocaleString() || 0} tokens</p>
                  </div>
                  <p className="font-mono">${((run.tokensCompletion || 0) * 0.00006).toFixed(4)}</p>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border bg-muted/50">
                  <p className="font-bold">Total Cost</p>
                  <p className="text-xl font-bold">${run.usdCost?.toFixed(4) || '0.0000'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
