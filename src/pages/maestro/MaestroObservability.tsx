import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Download,
  Activity,
  Clock,
  DollarSign,
  Zap
} from 'lucide-react';

export default function MaestroObservability() {
  const traces = [
    {
      id: 'trace-1',
      workflow: 'Customer Onboarding',
      agent: 'Research Agent',
      duration: '4.2s',
      tokens: 2840,
      cost: '$0.42',
      steps: 8,
      status: 'success',
      timestamp: '2 min ago'
    },
    {
      id: 'trace-2',
      workflow: 'Content Pipeline',
      agent: 'Content Generator',
      duration: '12.5s',
      tokens: 5620,
      cost: '$0.78',
      steps: 12,
      status: 'success',
      timestamp: '5 min ago'
    },
    {
      id: 'trace-3',
      workflow: 'Data Processing',
      agent: 'Data Analyzer',
      duration: '8.7s',
      tokens: 3240,
      cost: '$0.51',
      steps: 15,
      status: 'error',
      timestamp: '8 min ago'
    },
  ];

  const logs = [
    { level: 'info', message: 'Workflow WF-001 started execution', timestamp: '10:23:45', source: 'orchestrator' },
    { level: 'info', message: 'Agent Research Agent initialized', timestamp: '10:23:46', source: 'agent-manager' },
    { level: 'debug', message: 'Tool HTTP invoked with params {url: "..."}', timestamp: '10:23:47', source: 'tool-executor' },
    { level: 'warn', message: 'Rate limit approaching for OpenAI API', timestamp: '10:23:48', source: 'rate-limiter' },
    { level: 'error', message: 'Step 5 failed: Timeout after 30s', timestamp: '10:23:50', source: 'step-executor' },
    { level: 'info', message: 'Retry attempt 1/3 initiated', timestamp: '10:23:51', source: 'retry-handler' },
  ];

  const metrics = [
    { name: 'P50 Latency', value: '1.2s', change: '-0.3s', trend: 'down' },
    { name: 'P95 Latency', value: '4.8s', change: '-0.5s', trend: 'down' },
    { name: 'Token Usage', value: '124K', change: '+12K', trend: 'up' },
    { name: 'Error Rate', value: '2.3%', change: '-0.5%', trend: 'down' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-destructive';
      case 'warn':
        return 'text-amber-600';
      case 'debug':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Observability</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring and performance insights</p>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trend === 'down' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {metric.change} from last hour
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="traces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traces">Traces</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="traces" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Execution Traces</CardTitle>
                  <CardDescription>Step-by-step execution timeline with performance data</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input placeholder="Search traces..." className="w-full" />
                </div>
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {traces.map((trace) => (
                  <div 
                    key={trace.id} 
                    className="p-4 rounded-lg border border-border/50 hover:border-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{trace.workflow}</h4>
                          <Badge variant="outline" className={trace.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                            {trace.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {trace.agent} • {trace.id} • {trace.timestamp}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-medium">{trace.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tokens</p>
                          <p className="font-medium">{trace.tokens}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Cost</p>
                          <p className="font-medium">{trace.cost}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Steps</p>
                          <p className="font-medium">{trace.steps}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>Real-time log stream from all components</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input placeholder="Search logs..." className="w-full" />
                </div>
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-1 max-h-96 overflow-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex gap-4 py-1">
                    <span className="text-muted-foreground">{log.timestamp}</span>
                    <span className={`font-semibold w-12 ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-muted-foreground w-32">[{log.source}]</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Time-series charts and aggregations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Metrics charts coming soon</p>
                  <p className="text-xs text-muted-foreground">Latency histograms, throughput, error rates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
