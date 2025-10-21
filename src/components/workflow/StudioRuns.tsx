import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Play, Square, Eye } from 'lucide-react';
import { RunStatus } from '@/lib/types';

// Mock data for workflow runs
const mockRuns: {
  id: string;
  status: RunStatus;
  startedAt: string;
  durationMs?: number;
  tokensPrompt?: number;
  tokensCompletion?: number;
  usdCost?: number;
  agent: string;
}[] = [
  {
    id: 'run-001',
    status: 'succeeded',
    startedAt: '2025-10-15T10:30:00Z',
    durationMs: 45200,
    tokensPrompt: 12500,
    tokensCompletion: 8750,
    usdCost: 0.042,
    agent: 'ResearchAgent'
  },
  {
    id: 'run-002',
    status: 'running',
    startedAt: '2025-10-15T09:15:00Z',
    tokensPrompt: 8400,
    tokensCompletion: 5200,
    agent: 'MarketingAgent'
  },
  {
    id: 'run-003',
    status: 'failed',
    startedAt: '2025-10-14T16:45:00Z',
    durationMs: 120500,
    tokensPrompt: 32000,
    tokensCompletion: 18750,
    usdCost: 0.126,
    agent: 'SupportAgent'
  },
  {
    id: 'run-004',
    status: 'succeeded',
    startedAt: '2025-10-14T14:20:00Z',
    durationMs: 78300,
    tokensPrompt: 18700,
    tokensCompletion: 12450,
    usdCost: 0.068,
    agent: 'ResearchAgent'
  }
];

export default function StudioRuns() {
  const [selectedRun, setSelectedRun] = useState<string | null>(null);

  const handleRunWorkflow = () => {
    // In a real app, this would start a new workflow run
    alert('Workflow run started!');
  };

  const handleTerminateRun = (runId: string) => {
    // In a real app, this would terminate the run
    alert(`Terminating run ${runId}`);
  };

  const handleViewRun = (runId: string) => {
    // In a real app, this would navigate to the run details
    alert(`Viewing run ${runId}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Runs</h1>
          <p className="text-muted-foreground">Monitor and manage workflow executions</p>
        </div>
        <Button onClick={handleRunWorkflow}>
          <Play className="h-4 w-4 mr-2" />
          Run Workflow
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRuns.map((run) => (
                <TableRow 
                  key={run.id} 
                  className={selectedRun === run.id ? "bg-muted" : ""}
                  onClick={() => setSelectedRun(run.id === selectedRun ? null : run.id)}
                >
                  <TableCell className="font-medium">{run.id}</TableCell>
                  <TableCell>{run.agent}</TableCell>
                  <TableCell>
                    <StatusBadge status={run.status} />
                  </TableCell>
                  <TableCell>{new Date(run.startedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {run.tokensPrompt ? (
                      <span>
                        {run.tokensPrompt.toLocaleString()} in / {run.tokensCompletion?.toLocaleString()} out
                      </span>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {run.usdCost ? `$${run.usdCost.toFixed(4)}` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewRun(run.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={run.status !== 'running'}
                        onClick={() => handleTerminateRun(run.id)}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Terminate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}