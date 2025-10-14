import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockWorkflows } from '@/lib/mockData';
import { GitBranch, Clock, TrendingUp, Plus } from 'lucide-react';

export default function Workflows() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Automation pipelines and processes</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid gap-4">
        {mockWorkflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-md transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>{workflow.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      {workflow.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  {workflow.versions[workflow.versions.length - 1].status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Version</p>
                  <p className="text-sm font-mono">v{workflow.versions[workflow.versions.length - 1].version}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Avg Duration
                  </p>
                  <p className="text-sm font-mono">
                    {workflow.avgDurationMs ? `${(workflow.avgDurationMs / 1000).toFixed(1)}s` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Success Rate
                  </p>
                  <p className="text-sm font-mono">
                    {workflow.successRate ? `${(workflow.successRate * 100).toFixed(1)}%` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Run</p>
                  <p className="text-sm">
                    {workflow.lastRunAt ? new Date(workflow.lastRunAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium mb-2">Version History</p>
                <div className="flex gap-2 flex-wrap">
                  {workflow.versions.map(v => (
                    <Badge key={v.version} variant="outline" className="text-xs">
                      v{v.version}
                      {v.note && <span className="ml-1 text-muted-foreground">• {v.note}</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
