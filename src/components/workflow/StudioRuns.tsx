import { useState } from 'react';
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
import { Play, Square, Eye, Loader2 } from 'lucide-react';
import { useRuns } from '@/hooks/useRuns';
import { useNavigate } from 'react-router-dom';

export default function StudioRuns() {
  const navigate = useNavigate();
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  
  // Fetch real runs data
  const { data: runsData, isLoading } = useRuns(1, 100);
  const runs = runsData?.runs || [];

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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading runs...</span>
        </div>
      </div>
    );
  }

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
                <TableHead>Workflow</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No workflow runs found
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => (
                <TableRow 
                  key={run.id} 
                  className={selectedRun === run.id ? "bg-muted" : ""}
                  onClick={() => setSelectedRun(run.id === selectedRun ? null : run.id)}
                >
                  <TableCell className="font-medium">{run.id}</TableCell>
                  <TableCell>{run.workflowId || 'N/A'}</TableCell>
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
                      <Button variant="outline" size="sm" onClick={() => navigate(`/runs/${run.id}`)}>
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
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}