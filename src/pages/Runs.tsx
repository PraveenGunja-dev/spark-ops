import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockRuns, mockWorkflows, mockAgents } from '@/lib/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Filter, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Runs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRuns = mockRuns.filter(run => {
    const matchesSearch = run.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getWorkflowName = (workflowId: string) => {
    return mockWorkflows.find(w => w.id === workflowId)?.name || workflowId;
  };

  const getAgentName = (agentId: string) => {
    return mockAgents.find(a => a.id === agentId)?.name || agentId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Runs</h1>
          <p className="text-muted-foreground">Workflow execution history</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Run ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium">Run ID</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Workflow</th>
                  <th className="text-left p-3 text-sm font-medium">Agent</th>
                  <th className="text-left p-3 text-sm font-medium">Trigger</th>
                  <th className="text-left p-3 text-sm font-medium">Started</th>
                  <th className="text-left p-3 text-sm font-medium">Duration</th>
                  <th className="text-left p-3 text-sm font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="border-b hover:bg-muted/30 transition-smooth">
                    <td className="p-3">
                      <Link to={`/runs/${run.id}`} className="text-sm font-mono text-primary hover:underline">
                        {run.id}
                      </Link>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{getWorkflowName(run.workflowId)}</span>
                      <Badge variant="outline" className="ml-2 text-xs">v{run.workflowVersion}</Badge>
                    </td>
                    <td className="p-3 text-sm">{getAgentName(run.agentId)}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">{run.trigger}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(run.startedAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm">
                      {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : '-'}
                    </td>
                    <td className="p-3 text-sm">
                      {run.usdCost ? `$${run.usdCost.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredRuns.length} of {mockRuns.length} runs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
