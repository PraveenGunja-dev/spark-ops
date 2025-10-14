import { KpiCard } from '@/components/KpiCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, CheckCircle2, TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { mockRuns, mockIncidents } from '@/lib/mockData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const totalRuns24h = mockRuns.filter(r => {
    const runDate = new Date(r.startedAt);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return runDate > dayAgo;
  }).length;

  const successRate = (mockRuns.filter(r => r.status === 'succeeded').length / mockRuns.length) * 100;
  
  const avgDuration = Math.round(
    mockRuns.filter(r => r.durationMs).reduce((acc, r) => acc + (r.durationMs || 0), 0) / 
    mockRuns.filter(r => r.durationMs).length / 1000
  );

  const totalCost = mockRuns.reduce((acc, r) => acc + (r.usdCost || 0), 0);

  // Chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      succeeded: Math.floor(Math.random() * 100 + 50),
      failed: Math.floor(Math.random() * 20),
      running: Math.floor(Math.random() * 10),
    };
  });

  const costData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cost: parseFloat((Math.random() * 50 + 20).toFixed(2)),
    };
  });

  const recentRuns = mockRuns.slice(0, 5);
  const openIncidents = mockIncidents.filter(i => i.status === 'open');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">AI Process Automation Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Runs (24h)"
          value={totalRuns24h}
          change="+12% from yesterday"
          changeType="positive"
          icon={Play}
        />
        <KpiCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          change="+2.3% from last week"
          changeType="positive"
          icon={CheckCircle2}
        />
        <KpiCard
          title="Avg Duration"
          value={`${avgDuration}s`}
          change="-8% faster"
          changeType="positive"
          icon={Clock}
        />
        <KpiCard
          title="Token Spend"
          value={`$${totalCost.toFixed(2)}`}
          change="+$12.34 this week"
          changeType="neutral"
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Runs by Status</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="succeeded" stroke="hsl(var(--status-succeeded))" strokeWidth={2} />
                <Line type="monotone" dataKey="failed" stroke="hsl(var(--status-failed))" strokeWidth={2} />
                <Line type="monotone" dataKey="running" stroke="hsl(var(--status-running))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Spend</CardTitle>
            <CardDescription>Daily costs (USD)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="cost" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Runs</CardTitle>
            <CardDescription>Latest executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRuns.map((run) => (
                <Link 
                  key={run.id} 
                  to={`/runs/${run.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={run.status} />
                    <div>
                      <p className="text-sm font-medium">{run.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(run.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {run.durationMs && (
                    <p className="text-sm text-muted-foreground">
                      {(run.durationMs / 1000).toFixed(1)}s
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Open Incidents
            </CardTitle>
            <CardDescription>Requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {openIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open incidents</p>
            ) : (
              <div className="space-y-3">
                {openIncidents.map((incident) => (
                  <div 
                    key={incident.id}
                    className="flex items-start justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">{incident.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(incident.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      incident.severity === 'sev1' ? 'bg-destructive/10 text-destructive' :
                      incident.severity === 'sev2' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
