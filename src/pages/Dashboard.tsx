import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useRuns } from '@/hooks/useRuns';
import { useAgents } from '@/hooks/useAgents';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectSelector } from '@/components/ProjectSelector';
import { 
  Play, 
  Bot, 
  Wrench, 
  UserCheck, 
  BarChart3, 
  Shield,
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle
} from 'lucide-react';

// Mock data for charts
const runsPerHour = [
  { hour: '00:00', count: 12 },
  { hour: '04:00', count: 8 },
  { hour: '08:00', count: 24 },
  { hour: '12:00', count: 32 },
  { hour: '16:00', count: 28 },
  { hour: '20:00', count: 20 },
];

const costTrend = [
  { day: 'Mon', cost: 125.4 },
  { day: 'Tue', cost: 189.7 },
  { day: 'Wed', cost: 156.2 },
  { day: 'Thu', cost: 210.8 },
  { day: 'Fri', cost: 245.3 },
  { day: 'Sat', cost: 98.6 },
  { day: 'Sun', cost: 87.4 },
];

const topAgents = [
  { name: 'ResearchAgent', cost: 120.5, latency: 245 },
  { name: 'MarketingAgent', cost: 85.2, latency: 312 },
  { name: 'SupportAgent', cost: 65.8, latency: 187 },
  { name: 'DataProcessor', cost: 42.3, latency: 560 },
  { name: 'ReportGenerator', cost: 32.7, latency: 420 },
];

const recentEvents = [
  { id: '1', event: 'Run #812 started by ResearchAgent', time: '2 min ago', type: 'info' },
  { id: '2', event: 'Step 3 failed (tool timeout)', time: '5 min ago', type: 'error' },
  { id: '3', event: 'Akash approved run #1204 step 5', time: '8 min ago', type: 'success' },
  { id: '4', event: 'SupportAgent completed run #987', time: '12 min ago', type: 'success' },
  { id: '5', event: 'Budget alert for Marketing Team', time: '15 min ago', type: 'warning' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedProjectId } = useProject();
  
  // Fetch real data
  const { data: runsData, isLoading: runsLoading } = useRuns(1, 100);
  const { data: agentsData, isLoading: agentsLoading } = useAgents(selectedProjectId || '', 1, 100);
  
  const runs = runsData?.runs || [];
  const agents = agentsData?.items || [];
  
  // Calculate KPIs
  const activeRuns = runs.filter(run => run.status === 'running').length;
  const successRate = runs.length > 0 ? runs.filter(run => run.status === 'succeeded').length / runs.length * 100 : 0;
  const failedRuns = runs.filter(run => run.status === 'failed').length;
  const agentsOnline = agents.filter(agent => agent.health === 'healthy').length;
  const totalCost = runs.reduce((sum, run) => sum + (run.usdCost || 0), 0);
  const avgLatency = runs.length > 0 ? runs.reduce((sum, run) => sum + (run.durationMs || 0), 0) / runs.length : 0;
  
  const isLoading = runsLoading || agentsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Command Center</h1>
          <p className="text-muted-foreground">Real-time overview of your autonomous workforce</p>
        </div>
        <ProjectSelector />
      </div>

      {/* Maestro-inspired KPI Cards - High-contrast with minimal text */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="transition-all hover:shadow-md bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents Active</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentsOnline}</div>
            <p className="text-xs text-primary">+2 from last hour</p>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md bg-gradient-to-br from-success/10 to-success/20 dark:from-success/20 dark:to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runs Executing</CardTitle>
            <Play className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRuns}</div>
            <p className="text-xs text-success">+5 from last hour</p>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md bg-gradient-to-br from-warning/10 to-warning/20 dark:from-warning/20 dark:to-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgLatency)}ms</div>
            <p className="text-xs text-warning">-12% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md bg-gradient-to-br from-accent/10 to-accent/20 dark:from-accent/20 dark:to-accent/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens / Cost (24h)</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-accent">1.2M tokens</p>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md bg-gradient-to-br from-success/10 to-success/20 dark:from-success/20 dark:to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-success">+0.3% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts with Maestro-inspired styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Runs per Hour</CardTitle>
            <CardDescription>Execution volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={runsPerHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Avg Cost per Run</CardTitle>
            <CardDescription>Daily cost fluctuations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity feed and system health with Maestro-inspired layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Activity Feed</CardTitle>
            <CardDescription>Real-time system events and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="mt-1">
                    {event.type === 'error' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {event.type === 'success' && <Activity className="h-4 w-4 text-success" />}
                    {event.type === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
                    {event.type === 'info' && <Activity className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <p className="text-sm">{event.event}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Infrastructure status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Worker Nodes</h3>
                  <p className="text-sm text-muted-foreground">Heartbeat status</p>
                </div>
                <Badge variant="default">8/8 Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Queue Backlog</h3>
                  <p className="text-sm text-muted-foreground">Redis depth</p>
                </div>
                <Badge variant="secondary">1,247 items</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Database</h3>
                  <p className="text-sm text-muted-foreground">Latency / uptime</p>
                </div>
                <Badge variant="default">12ms / 99.98%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Policy Violations</h3>
                  <p className="text-sm text-muted-foreground">Last 24 hours</p>
                </div>
                <Badge variant="destructive">3 active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}