import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Eye, MessageSquare, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReasoningTraceViewer } from '@/components/apa/ReasoningTraceViewer';
import { AgentMemoryViewer } from '@/components/apa/AgentMemoryViewer';
import { toast } from 'sonner';

// Mock data - replace with actual API calls
const mockAgent = {
  id: '1',
  name: 'Customer Support Agent',
  description: 'Handles customer inquiries and support tickets',
  type: 'task_oriented',
  status: 'active',
  model: 'gpt-4',
  provider: 'openai',
  temperature: 7,
  max_tokens: 2000,
  enable_reasoning: true,
  enable_collaboration: false,
  enable_learning: true,
  max_iterations: 10,
  created_at: '2025-10-15T10:00:00Z',
};

const mockReasoningTraces = [
  {
    id: '1',
    run_id: 'run-123',
    step_index: 0,
    thought: 'I need to search for information about the user\'s question regarding API rate limits.',
    action: {
      type: 'search',
      description: 'Search knowledge base',
      parameters: { query: 'API rate limits' },
    },
    observation: {
      status: 'success',
      result: 'Found 3 relevant articles about API rate limiting.',
    },
    reflection: 'The search was successful and returned relevant information.',
    tokens_used: 150,
    latency_ms: 1250,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    run_id: 'run-123',
    step_index: 1,
    thought: 'Now I should calculate the current rate limit based on the user\'s plan.',
    action: {
      type: 'calculate',
      description: 'Calculate rate limit',
      parameters: { expression: '100 * 60' },
    },
    observation: {
      status: 'success',
      result: { result: 6000, expression: '100 * 60' },
    },
    tokens_used: 120,
    latency_ms: 850,
    created_at: new Date().toISOString(),
  },
];

const mockMemories = [
  {
    id: '1',
    type: 'episodic' as const,
    content: 'User John Doe requested help with API integration on 2025-10-20. Resolved by providing SDK documentation.',
    importance_score: 0.75,
    access_count: 5,
    created_at: '2025-10-20T14:30:00Z',
    last_accessed_at: '2025-10-21T09:15:00Z',
  },
  {
    id: '2',
    type: 'semantic' as const,
    content: 'API rate limits are 100 requests per minute for standard plans and 1000 requests per minute for enterprise plans.',
    importance_score: 0.90,
    access_count: 12,
    created_at: '2025-10-15T10:00:00Z',
    last_accessed_at: '2025-10-21T11:20:00Z',
  },
  {
    id: '3',
    type: 'procedural' as const,
    content: 'When handling authentication errors, first check if the API key is valid, then verify user permissions.',
    importance_score: 0.85,
    access_count: 8,
    created_at: '2025-10-18T16:45:00Z',
  },
];

export default function AgentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isExecuting, setIsExecuting] = useState(false);

  // In production, fetch agent data from API
  const agent = mockAgent;

  const handleExecuteTask = async () => {
    setIsExecuting(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Task executed successfully');
    } catch (error) {
      toast.error('Failed to execute task');
    } finally {
      setIsExecuting(false);
    }
  };

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
            <p className="text-muted-foreground">{agent.description}</p>
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
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                  {agent.status}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agent.model}</div>
                <p className="text-xs text-muted-foreground">{agent.provider}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="capitalize">
                  {agent.type.replace('_', ' ')}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Max Iterations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agent.max_iterations}</div>
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
                  <span className="text-sm font-medium">Temperature</span>
                  <p className="text-2xl font-bold">{agent.temperature / 10}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Max Tokens</span>
                  <p className="text-2xl font-bold">{agent.max_tokens.toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <span className="text-sm font-medium">Capabilities</span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={agent.enable_reasoning ? 'default' : 'secondary'}>
                    Reasoning {agent.enable_reasoning ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Badge variant={agent.enable_collaboration ? 'default' : 'secondary'}>
                    Collaboration {agent.enable_collaboration ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Badge variant={agent.enable_learning ? 'default' : 'secondary'}>
                    Learning {agent.enable_learning ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reasoning Tab */}
        <TabsContent value="reasoning" className="space-y-4">
          <ReasoningTraceViewer traces={mockReasoningTraces} />
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value="memory" className="space-y-4">
          <AgentMemoryViewer 
            memories={mockMemories}
            onSearch={(query) => console.log('Search:', query)}
            onFilterType={(type) => console.log('Filter type:', type)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
