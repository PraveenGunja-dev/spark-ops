import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { Search, Filter, Play, Pause, Square, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRuns } from '@/hooks/useRuns';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useAgents } from '@/hooks/useAgents';
import { useProjects } from '@/hooks/useProjects';

export default function Runs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Get first project
  const { data: projectsData } = useProjects(1, 1);
  const projectId = projectsData?.items[0]?.id;
  
  // Fetch data
  const { data: runsData, isLoading } = useRuns(
    page,
    pageSize,
    {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      agentId: agentFilter !== 'all' ? agentFilter : undefined,
    }
  );
  
  const { data: workflowsData } = useWorkflows(projectId || '', 1, 100);
  const { data: agentsData } = useAgents(projectId || '', 1, 100);
  
  const runs = runsData?.runs || [];
  const workflows = workflowsData?.items || [];
  const agents = agentsData?.items || [];
  const totalPages = runsData?.totalPages || 1;
  
  // Filter by search query (client-side for ID search)
  const filteredRuns = runs.filter(run =>
    run.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getWorkflowName = (workflowId: string) => {
    return workflows.find(w => w.id === workflowId)?.name || workflowId;
  };

  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.name || agentId;
  };

  const uniqueAgents = Array.from(new Set(runs.map(run => run.agentId)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Runs</h1>
          <p className="text-muted-foreground">Live view of all active, completed, or failed runs</p>
        </div>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Start New Run
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search runs by ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="timeout">Timeout</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {uniqueAgents.map(agentId => (
                    <SelectItem key={agentId} value={agentId}>
                      {getAgentName(agentId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={10} columns={8} />
          ) : (
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
              {filteredRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">{run.id}</TableCell>
                  <TableCell>{getAgentName(run.agentId)}</TableCell>
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Replay
                      </Button>
                      <Button variant="outline" size="sm" disabled={run.status !== 'running'}>
                        <Square className="h-4 w-4 mr-1" />
                        Terminate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}