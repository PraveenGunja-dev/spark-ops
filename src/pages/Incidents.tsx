import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockIncidents } from '@/lib/mockData';
import { AlertTriangle } from 'lucide-react';

export default function Incidents() {
  const severityColors = {
    sev1: 'bg-destructive/10 text-destructive border-destructive/20',
    sev2: 'bg-warning/10 text-warning border-warning/20',
    sev3: 'bg-muted text-muted-foreground border-muted',
  };

  const statusColors = {
    open: 'bg-destructive/10 text-destructive border-destructive/20',
    mitigated: 'bg-warning/10 text-warning border-warning/20',
    resolved: 'bg-success/10 text-success border-success/20',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incidents</h1>
        <p className="text-muted-foreground">System incidents and alerts</p>
      </div>

      <div className="grid gap-4">
        {mockIncidents.map((incident) => (
          <Card key={incident.id} className="hover:shadow-md transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{incident.title}</h3>
                      <Badge variant="outline" className={severityColors[incident.severity]}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={statusColors[incident.status]}>
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Created {new Date(incident.createdAt).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Related runs: {incident.runIds.length}
                      </span>
                      <span className="text-muted-foreground">
                        SLA: {incident.slaMinutes} minutes
                      </span>
                    </div>
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
