import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  BarChart3,
  Zap,
  Cpu,
  Activity
} from 'lucide-react';

export default function MaestroAgents() {
  const agents = [
    {
      id: 'a-1',
      name: 'Research Agent',
      type: 'Planner',
      framework: 'LangChain',
      status: 'running',
      uptime: '99.8%',
      costPerRun: '$0.45',
      successRate: 94,
      runsToday: 127,
      avgLatency: '1.2s',
      description: 'Autonomous research and data gathering agent with web search capabilities'
    },
    {
      id: 'a-2',
      name: 'Content Generator',
      type: 'Writer',
      framework: 'CrewAI',
      status: 'idle',
      uptime: '100%',
      costPerRun: '$0.32',
      successRate: 98,
      runsToday: 84,
      avgLatency: '0.9s',
      description: 'Multi-format content creation with style adaptation and SEO optimization'
    },
    {
      id: 'a-3',
      name: 'Data Analyzer',
      type: 'Validator',
      framework: 'AutoGen',
      status: 'running',
      uptime: '97.3%',
      costPerRun: '$0.58',
      successRate: 89,
      runsToday: 203,
      avgLatency: '2.1s',
      description: 'Complex data processing and pattern recognition with statistical analysis'
    },
    {
      id: 'a-4',
      name: 'Quality Checker',
      type: 'Validator',
      framework: 'LangChain',
      status: 'running',
      uptime: '99.5%',
      costPerRun: '$0.28',
      successRate: 96,
      runsToday: 156,
      avgLatency: '0.7s',
      description: 'Automated quality assurance and compliance checking'
    },
    {
      id: 'a-5',
      name: 'Workflow Coordinator',
      type: 'Orchestrator',
      framework: 'AutoGen',
      status: 'running',
      uptime: '98.9%',
      costPerRun: '$0.41',
      successRate: 92,
      runsToday: 98,
      avgLatency: '1.5s',
      description: 'Multi-agent coordination and task distribution'
    },
    {
      id: 'a-6',
      name: 'Customer Support Bot',
      type: 'Conversational',
      framework: 'CrewAI',
      status: 'idle',
      uptime: '99.2%',
      costPerRun: '$0.19',
      successRate: 97,
      runsToday: 412,
      avgLatency: '0.5s',
      description: 'Context-aware customer interaction and issue resolution'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'idle':
        return 'bg-muted text-muted-foreground border-border';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'LangChain':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'CrewAI':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'AutoGen':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground mt-1">Manage your autonomous AI workforce</p>
        </div>
        <Button className="bg-gradient-to-r from-accent to-accent/80">
          <Bot className="mr-2 h-4 w-4" />
          Deploy New Agent
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">4 running, 2 idle</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.3%</div>
            <p className="text-xs text-emerald-600">+2.1% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,080</div>
            <p className="text-xs text-muted-foreground">+156 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.15s</div>
            <p className="text-xs text-emerald-600">-0.2s improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-all border-border/50 hover:border-accent/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{agent.type}</CardDescription>
                  </div>
                </div>
                {agent.status === 'running' && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.description}
              </p>

              <div className="flex gap-2">
                <Badge variant="outline" className={getFrameworkColor(agent.framework)}>
                  {agent.framework}
                </Badge>
                <Badge variant="outline" className={getStatusColor(agent.status)}>
                  {agent.status === 'running' && <Activity className="mr-1 h-3 w-3" />}
                  {agent.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-sm font-semibold mt-1">{agent.successRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="text-sm font-semibold mt-1">{agent.uptime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cost/Run</p>
                  <p className="text-sm font-semibold mt-1">{agent.costPerRun}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Latency</p>
                  <p className="text-sm font-semibold mt-1">{agent.avgLatency}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Runs Today</p>
                <p className="text-2xl font-bold">{agent.runsToday}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="mr-1 h-3 w-3" />
                  Configure
                </Button>
                {agent.status === 'running' ? (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Pause className="mr-1 h-3 w-3" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="mr-1 h-3 w-3" />
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
