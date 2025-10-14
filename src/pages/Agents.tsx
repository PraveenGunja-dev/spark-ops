import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAgents, mockTools } from '@/lib/mockData';
import { Bot, Activity, Cpu } from 'lucide-react';

export default function Agents() {
  const getToolNames = (toolIds: string[]) => {
    return toolIds.map(id => mockTools.find(t => t.id === id)?.name || id).join(', ');
  };

  const healthColors = {
    healthy: 'bg-success/10 text-success border-success/20',
    degraded: 'bg-warning/10 text-warning border-warning/20',
    unhealthy: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agents</h1>
        <p className="text-muted-foreground">AI agents and their configurations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                </div>
                <Badge variant="outline" className={healthColors[agent.health]}>
                  {agent.health}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{agent.promptSummary}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Runtime</span>
                  <Badge variant="secondary">{agent.runtime}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-mono">{agent.model}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Environment</span>
                  <Badge variant="outline">{agent.env}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Concurrency</span>
                  <span className="font-mono">{agent.concurrency}</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Autoscale</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Min: {agent.autoscale.min} • Max: {agent.autoscale.max}</p>
                  <p>Target CPU: {agent.autoscale.targetCpu}%</p>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs font-medium mb-1">Tools</p>
                <p className="text-xs text-muted-foreground">{getToolNames(agent.tools)}</p>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  <span>Last heartbeat: {new Date(agent.lastHeartbeat).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
