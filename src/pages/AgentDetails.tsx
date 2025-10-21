import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Activity, Clock, DollarSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAgent, useDeleteAgent } from '@/hooks/useAgents';
import { useRuns } from '@/hooks/useRuns';
import { EditAgentDialog } from '@/components/agents/EditAgentDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { toast } from 'sonner';
import type { Run } from '@/lib/types';

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Fetch agent and runs data
  const { data: agent, isLoading: agentLoading, error: agentError, refetch: refetchAgent } = useAgent(id!);
  const { data: runsData, isLoading: runsLoading } = useRuns(1, 10, { agentId: id });
  
  // Mutations
  const deleteAgent = useDeleteAgent();
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetchAgent();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, refetchAgent]);
  
  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteAgent.mutateAsync(id);
      toast.success('Agent deleted successfully');
      navigate('/agents');
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };
  
  // Loading state
  if (agentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Error state
  if (agentError || !agent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Agent not found</h1>
        </div>
      </div>
    );
  }
  
  const runs = runsData?.runs || [];
  
  // Calculate metrics from runs
  const totalRuns = runs.length;
  const succeededRuns = runs.filter(r => r.status === 'succeeded').length;
  const failedRuns = runs.filter(r => r.status === 'failed').length;
  const successRate = totalRuns > 0 ? (succeededRuns / totalRuns) * 100 : 0;
  const avgCost = runs.reduce((sum, r) => sum + (r.usdCost || 0), 0) / (totalRuns || 1);
  const avgDuration = runs.reduce((sum, r) => sum + (r.durationMs || 0), 0) / (totalRuns || 1);
  
  // Health status badge
  const getHealthBadge = (health: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; icon: any }> = {
      healthy: { variant: 'default', icon: CheckCircle },
      degraded: { variant: 'secondary', icon: Activity },
      unhealthy: { variant: 'destructive', icon: XCircle },
    };
    const config = variants[health] || variants.healthy;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {health}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            <p className="text-muted-foreground">{agent.runtime} · {agent.model}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            {getHealthBadge(agent.health)}
            <p className="text-xs text-muted-foreground mt-2">
              Last heartbeat: {new Date(agent.lastHeartbeat).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {succeededRuns}/{totalRuns} runs succeeded
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {avgDuration > 0 ? `${(avgDuration / 1000).toFixed(1)}s` : '-'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Per execution</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Avg Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {avgCost > 0 ? `$${avgCost.toFixed(4)}` : '-'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Per execution</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="runs">Run History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Agent Information</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Runtime</p>
                  <p className="text-sm mt-1">{agent.runtime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Model</p>
                  <p className="text-sm mt-1">{agent.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Environment</p>
                  <Badge variant="outline" className="mt-1">{agent.env}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Concurrency</p>
                  <p className="text-sm mt-1">{agent.concurrency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tools</p>
                  <p className="text-sm mt-1">{agent.tools.length} tools configured</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Health</p>
                  {getHealthBadge(agent.health)}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prompt Summary</p>
                <p className="text-sm mt-1 text-muted-foreground">{agent.promptSummary}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Autoscaling Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Min Instances</p>
                  <p className="text-2xl font-bold mt-1">{agent.autoscale.min}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Max Instances</p>
                  <p className="text-2xl font-bold mt-1">{agent.autoscale.max}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Target CPU</p>
                  <p className="text-2xl font-bold mt-1">{agent.autoscale.targetCpu}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Agent ID</p>
                <p className="text-sm mt-1 font-mono">{agent.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project ID</p>
                <p className="text-sm mt-1 font-mono">{agent.projectId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Runtime</p>
                <p className="text-sm mt-1">{agent.runtime}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Model</p>
                <p className="text-sm mt-1">{agent.model}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Configured Tools</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {agent.tools.length > 0 ? (
                    agent.tools.map((toolId) => (
                      <Badge key={toolId} variant="secondary">
                        {toolId}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tools configured</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Runs</CardTitle>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : runs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No runs found</p>
              ) : (
                <div className="space-y-2">
                  {runs.map((run: Run) => (
                    <Link 
                      key={run.id} 
                      to={`/runs/${run.id}`}
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono">{run.id}</p>
                            <Badge variant={
                              run.status === 'succeeded' ? 'default' :
                              run.status === 'failed' ? 'destructive' :
                              run.status === 'running' ? 'secondary' : 'outline'
                            }>
                              {run.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(run.startedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : '-'}
                          </div>
                          <div>
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            {run.usdCost ? `$${run.usdCost.toFixed(4)}` : '-'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditAgentDialog 
        agent={agent}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Agent"
        description="This will permanently delete this agent and all associated configurations. Any workflows using this agent may fail."
        itemName={agent.name}
        isDeleting={deleteAgent.isPending}
      />
    </div>
  );
}
