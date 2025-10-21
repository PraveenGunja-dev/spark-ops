import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { Search, RefreshCw, X, ExternalLink, RotateCcw } from 'lucide-react';
import { useRuns } from '@/hooks/useRuns';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useAgents } from '@/hooks/useAgents';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectSelector } from '@/components/ProjectSelector';
import { CreateRunDialog } from '@/components/runs/CreateRunDialog';
import { Pagination } from '@/components/ui/pagination';
import { MultiSelectFilter, type FilterOption } from '@/components/filters/MultiSelectFilter';
import { DateRangePicker, type DateRange } from '@/components/filters/DateRangePicker';
import { FilterChips } from '@/components/filters/FilterChips';
import { SavedFilters } from '@/components/filters/SavedFilters';

export default function Runs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Get selected project from context
  const { selectedProjectId } = useProject();
  
  // Fetch data
  const { data: runsData, isLoading, refetch } = useRuns(
    page,
    pageSize,
    {
      status: selectedStatuses.length > 0 ? selectedStatuses[0] : undefined,
      agentId: selectedAgents.length > 0 ? selectedAgents[0] : undefined,
    }
  );
  
  const { data: workflowsData } = useWorkflows(selectedProjectId || '', 1, 100);
  const { data: agentsData } = useAgents(selectedProjectId || '', 1, 100);
  
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

  // Status filter options
  const statusOptions: FilterOption[] = [
    { value: 'queued', label: 'Queued', count: runs.filter(r => r.status === 'queued').length },
    { value: 'running', label: 'Running', count: runs.filter(r => r.status === 'running').length },
    { value: 'succeeded', label: 'Succeeded', count: runs.filter(r => r.status === 'succeeded').length },
    { value: 'failed', label: 'Failed', count: runs.filter(r => r.status === 'failed').length },
    { value: 'cancelled', label: 'Cancelled', count: runs.filter(r => r.status === 'cancelled').length },
    { value: 'timeout', label: 'Timeout', count: runs.filter(r => r.status === 'timeout').length },
  ];

  // Environment filter options
  const envOptions: FilterOption[] = [
    { value: 'dev', label: 'Development' },
    { value: 'staging', label: 'Staging' },
    { value: 'prod', label: 'Production' },
  ];

  // Agent filter options
  const agentOptions: FilterOption[] = agents.map(agent => ({
    value: agent.id,
    label: agent.name,
  }));

  // Filter chips
  const activeFilters = [
    ...selectedStatuses.map(status => ({
      type: 'multi' as const,
      label: 'Status',
      value: selectedStatuses,
      onRemove: () => setSelectedStatuses([]),
    })),
    ...selectedEnvironments.map(env => ({
      type: 'multi' as const,
      label: 'Environment',
      value: selectedEnvironments,
      onRemove: () => setSelectedEnvironments([]),
    })),
    ...selectedAgents.map(agentId => ({
      type: 'multi' as const,
      label: 'Agent',
      value: selectedAgents,
      onRemove: () => setSelectedAgents([]),
    })),
    ...(dateRange?.from ? [({
      type: 'date' as const,
      label: 'Date Range',
      value: dateRange,
      onRemove: () => setDateRange(undefined),
    })] : []),
  ];

  const handleClearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedEnvironments([]);
    setSelectedAgents([]);
    setDateRange(undefined);
  };

  const handleApplyFilters = (filters: Record<string, any>) => {
    if (filters.statuses) setSelectedStatuses(filters.statuses);
    if (filters.environments) setSelectedEnvironments(filters.environments);
    if (filters.agents) setSelectedAgents(filters.agents);
    if (filters.dateRange) setDateRange(filters.dateRange);
  };

  const currentFilters = {
    statuses: selectedStatuses,
    environments: selectedEnvironments,
    agents: selectedAgents,
    dateRange,
  };

  const uniqueAgents = Array.from(new Set(runs.map(run => run.agentId)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Runs</h1>
          <p className="text-muted-foreground">Live view of all active, completed, or failed runs</p>
        </div>
        <div className="flex items-center gap-3">
          <ProjectSelector />
          <CreateRunDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
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
                <MultiSelectFilter
                  title="Status"
                  options={statusOptions}
                  selected={selectedStatuses}
                  onChange={setSelectedStatuses}
                  className="w-[160px]"
                />
                
                <MultiSelectFilter
                  title="Environment"
                  options={envOptions}
                  selected={selectedEnvironments}
                  onChange={setSelectedEnvironments}
                  className="w-[160px]"
                />
                
                <MultiSelectFilter
                  title="Agent"
                  options={agentOptions}
                  selected={selectedAgents}
                  onChange={setSelectedAgents}
                  className="w-[160px]"
                />
                
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Date range"
                />
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <SavedFilters
                  pageKey="runs"
                  currentFilters={currentFilters}
                  onApplyFilter={handleApplyFilters}
                />
              </div>
            </div>
            
            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <FilterChips
                filters={activeFilters}
                onClearAll={handleClearAllFilters}
              />
            )}
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
                      <Link to={`/runs/${run.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" disabled>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Retry
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

      {/* Pagination */}
      {!isLoading && filteredRuns.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          total={runsData?.total || 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}