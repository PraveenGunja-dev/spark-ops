import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Eye, MessageSquare, Settings, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReasoningTraceViewer } from '@/components/apa/ReasoningTraceViewer';
import { AgentMemoryViewer } from '@/components/apa/AgentMemoryViewer';
import { toast } from 'sonner';
import { useAgent } from '@/hooks/useAgents';
import { useAgentReason, useReasoningTraces, useAgentMemory, useSearchMemory } from '@/hooks/useAPA';

// APA integration - using real API hooks

export default function AgentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [memoryTypeFilter, setMemoryTypeFilter] = useState<string | undefined>();

  // Fetch agent data from API
  const { data: agent, isLoading: agentLoading, error: agentError } = useAgent(id!);
  
  // Fetch reasoning traces
  const { data: tracesData, isLoading: tracesLoading } = useReasoningTraces(id!, undefined, {
    enabled: activeTab === 'reasoning',
  });
  
  // Fetch agent memory
  const { data: memoryData, isLoading: memoryLoading } = useAgentMemory(
    id!, 
    memoryTypeFilter as 'episodic' | 'semantic' | 'procedural' | undefined, 
    {
      enabled: activeTab === 'memory',
    }
  );
  
  // Execute agent reasoning
  const { mutate: executeReason, isPending: isExecuting } = useAgentReason(id!);
  
  // Search memory
  const { mutate: searchMemory, isPending: isSearching } = useSearchMemory(id!);

  const handleExecuteTask = () => {
    executeReason(
      {
        description: 'Analyze and process the current task',
        parameters: {},
        max_iterations: 10,
      },
      {
        onSuccess: (data) => {
          toast.success(`Task executed successfully! ${data.result.iterations} iterations completed.`);
          // Switch to reasoning tab to see the traces
          setActiveTab('reasoning');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to execute task');
        },
      }
    );
  };
  
  const handleMemorySearch = (query: string) => {
    searchMemory(
      { query, limit: 20 },
      {
        onSuccess: (data) => {
          toast.success(`Found ${data.count} relevant memories`);
        },
        onError: (error: any) => {
          toast.error('Memory search failed');
        },
      }
    );
  };
  
  const handleMemoryFilterType = (type: string) => {
    const validTypes = ['episodic', 'semantic', 'procedural'];
    setMemoryTypeFilter(type === '' || !validTypes.includes(type) ? undefined : type);
  };

  // Loading state
  if (agentLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading agent details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (agentError || !agent) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Agent Not Found</h2>
          <p className="text-muted-foreground mb-4">The agent you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/maestro/agents')}>Back to Agents</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/agents')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
            <p className="text-muted-foreground">{agent.promptSummary || 'No description available'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/agents/${id}/settings`)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleExecuteTask} disabled={isExecuting}>
            <Play className="h-4 w-4 mr-2" />
            {isExecuting ? 'Executing...' : 'Execute Task'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reasoning">
            <Brain className="h-4 w-4 mr-2" />
            Reasoning
          </TabsTrigger>
          <TabsTrigger value="memory">
            <MessageSquare className="h-4 w-4 mr-2" />
            Memory
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Health</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={agent.health === 'healthy' ? 'default' : 'secondary'}>
                  {agent.health}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agent.model}</div>
                <p className="text-xs text-muted-foreground">{agent.runtime}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Runtime</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="capitalize">
                  {agent.runtime}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Concurrency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agent.concurrency}</div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Agent settings and capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Environment</span>
                  <p className="text-2xl font-bold capitalize">{agent.env}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Tools</span>
                  <p className="text-2xl font-bold">{agent.tools?.length || 0}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <span className="text-sm font-medium">Autoscaling</span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Min: {agent.autoscale.min}
                  </Badge>
                  <Badge variant="outline">
                    Max: {agent.autoscale.max}
                  </Badge>
                  <Badge variant="outline">
                    Target CPU: {agent.autoscale.targetCpu}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reasoning Tab */}
        <TabsContent value="reasoning" className="space-y-4">
          {tracesLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading reasoning traces...</span>
            </div>
          ) : tracesData && tracesData.traces.length > 0 ? (
            <ReasoningTraceViewer traces={tracesData.traces} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reasoning Traces Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Execute a task to see the agent's reasoning process
                </p>
                <Button onClick={handleExecuteTask} disabled={isExecuting}>
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Task
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value="memory" className="space-y-4">
          {memoryLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading agent memory...</span>
            </div>
          ) : memoryData && memoryData.memories.length > 0 ? (
            <AgentMemoryViewer 
              memories={memoryData.memories.map(m => ({
                ...m,
                access_count: m.access_count || 0
              }))}
              onSearch={handleMemorySearch}
              onFilterType={handleMemoryFilterType}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Memories Stored</h3>
                <p className="text-muted-foreground text-center">
                  The agent hasn't stored any memories yet. Memories will be created as the agent executes tasks.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
