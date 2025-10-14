import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockSchedules, mockWorkflows } from '@/lib/mockData';
import { Clock, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Schedules() {
  const getWorkflowName = (workflowId: string) => {
    return mockWorkflows.find(w => w.id === workflowId)?.name || workflowId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedules</h1>
        <p className="text-muted-foreground">Automated workflow triggers</p>
      </div>

      <div className="grid gap-4">
        {mockSchedules.map((schedule) => (
          <Card key={schedule.id} className="hover:shadow-md transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Clock className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{schedule.name}</h3>
                      <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                        {schedule.status}
                      </Badge>
                      <Badge variant="outline">{schedule.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Workflow: {getWorkflowName(schedule.targetWorkflowId)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Expression</p>
                    <p className="text-sm font-mono">{schedule.expression || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next Run</p>
                    <p className="text-sm">{new Date(schedule.nextRunAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Run</p>
                    <p className="text-sm">
                      {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : '-'}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    {schedule.status === 'active' ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
