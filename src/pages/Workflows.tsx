import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectSelector } from '@/components/ProjectSelector';
import { CreateWorkflowDialog } from '@/components/workflows/CreateWorkflowDialog';
import { useState } from 'react';
import { GitBranch, Clock, TrendingUp, Plus } from 'lucide-react';

export default function Workflows() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  
  // Get selected project from context
  const { selectedProjectId } = useProject();
  
  // Fetch workflows
  const { data, isLoading } = useWorkflows(selectedProjectId || '', page, pageSize);
  const workflows = data?.items || [];
  const totalPages = data?.totalPages || 1;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Automation pipelines and processes</p>
        </div>
        <div className="flex items-center gap-3">
          <ProjectSelector />
          <CreateWorkflowDialog />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">No workflows found. Create your first workflow to get started.</p>
          </div>
        ) : (
        workflows.map((workflow) => {
          // Get the latest version, with a safety check for empty arrays
          const latestVersion = workflow.versions.length > 0 
            ? workflow.versions[workflow.versions.length - 1] 
            : null;
          
          return (
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
                  {latestVersion && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {latestVersion.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Version</p>
                    <p className="text-sm font-mono">
                      {latestVersion ? `v${latestVersion.version}` : 'N/A'}
                    </p>
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
          );
        }))
        }
      </div>
    </div>
  );
}