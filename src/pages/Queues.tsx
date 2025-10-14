import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockQueues } from '@/lib/mockData';
import { Database, AlertTriangle } from 'lucide-react';

export default function Queues() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Queues</h1>
        <p className="text-muted-foreground">Work queues and message processing</p>
      </div>

      <div className="grid gap-4">
        {mockQueues.map((queue) => (
          <Card key={queue.id} className="hover:shadow-md transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">{queue.name}</h3>
                    <p className="text-sm text-muted-foreground">Project: {queue.projectId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Depth</p>
                    <p className="text-2xl font-bold">{queue.depth.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Oldest Age</p>
                    <p className="text-sm font-mono">{Math.floor(queue.oldestAgeSec / 60)}m</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate</p>
                    <p className="text-sm font-mono">{queue.ratePerSec}/sec</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Leases</p>
                    <p className="text-sm font-mono">{queue.leases}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      DLQ
                    </p>
                    <p className={`text-sm font-mono ${queue.dlqSize > 0 ? 'text-destructive' : ''}`}>
                      {queue.dlqSize}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
