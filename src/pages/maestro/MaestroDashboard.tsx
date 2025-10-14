import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Workflow, 
  Activity, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaestroDashboard() {
  const activeAgents = [
    { name: 'Research Agent', status: 'running', uptime: '99.8%', cost: '$12.40', performance: 94 },
    { name: 'Content Generator', status: 'idle', uptime: '100%', cost: '$8.20', performance: 98 },
    { name: 'Data Analyzer', status: 'running', uptime: '97.3%', cost: '$15.80', performance: 89 },
    { name: 'Quality Checker', status: 'running', uptime: '99.5%', cost: '$6.50', performance: 96 },
  ];

  const runningWorkflows = [
    { id: 'WF-001', name: 'Customer Onboarding', progress: 65, status: 'running', agent: 'Research Agent' },
    { id: 'WF-002', name: 'Content Pipeline', progress: 40, status: 'running', agent: 'Content Generator' },
    { id: 'WF-003', name: 'Data Processing', progress: 85, status: 'running', agent: 'Data Analyzer' },
  ];

  const recentAlerts = [
    { id: 1, message: 'Workflow WF-001 requires approval', time: '2 min ago', type: 'warning' },
    { id: 2, message: 'Agent deployed successfully', time: '5 min ago', type: 'success' },
    { id: 3, message: 'Cost threshold reached for Research Agent', time: '12 min ago', type: 'warning' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Agentic Orchestration Console
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your AI workforce</p>
        </div>
        <Button className="gradient-primary">
          <Play className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last hour</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 pending approval</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-success">-0.3s from yesterday</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$42.90</div>
            <p className="text-xs text-muted-foreground">68% of budget</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Agents */}
        <Card>
          <CardHeader>
            <CardTitle>Active Agents</CardTitle>
            <CardDescription>AI agents currently deployed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeAgents.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Uptime: {agent.uptime}</span>
                      <span>•</span>
                      <span>Cost: {agent.cost}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{agent.performance}%</div>
                  <div className="text-xs text-muted-foreground">Performance</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Running Workflows */}
        <Card>
          <CardHeader>
            <CardTitle>Running Workflows</CardTitle>
            <CardDescription>Active process executions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {runningWorkflows.map((workflow) => (
              <div key={workflow.id} className="space-y-2 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{workflow.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {workflow.id} • {workflow.agent}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <Activity className="mr-1 h-3 w-3" />
                    Running
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{workflow.progress}%</span>
                  </div>
                  <Progress value={workflow.progress} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Health & Recent Alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Infrastructure metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CPU Usage</span>
                <span className="font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Memory</span>
                <span className="font-medium">62%</span>
              </div>
              <Progress value={62} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Queue Latency</span>
                <span className="font-medium">8ms</span>
              </div>
              <Progress value={15} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Alerts & Approvals</CardTitle>
            <CardDescription>Activity feed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="mt-1">
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
