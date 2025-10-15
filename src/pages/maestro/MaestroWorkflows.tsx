import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Workflow, 
  Play, 
  Pencil, 
  Copy,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function MaestroWorkflows() {
  const workflows = [
    {
      id: 'wf-1',
      name: 'Customer Onboarding',
      description: 'Automated customer data collection, verification, and setup',
      status: 'active',
      nodes: 12,
      avgDuration: '4.2 min',
      successRate: 96,
      lastRun: '5 min ago',
      runsToday: 24,
      tags: ['CRM', 'Automation']
    },
    {
      id: 'wf-2',
      name: 'Content Pipeline',
      description: 'Research → Write → Review → Publish workflow',
      status: 'active',
      nodes: 8,
      avgDuration: '12.5 min',
      successRate: 94,
      lastRun: '12 min ago',
      runsToday: 18,
      tags: ['Content', 'Marketing']
    },
    {
      id: 'wf-3',
      name: 'Data Processing',
      description: 'Extract, transform, validate, and load data pipeline',
      status: 'active',
      nodes: 15,
      avgDuration: '8.7 min',
      successRate: 89,
      lastRun: '2 min ago',
      runsToday: 45,
      tags: ['Data', 'ETL']
    },
    {
      id: 'wf-4',
      name: 'Support Ticket Router',
      description: 'Intelligent ticket classification and routing',
      status: 'draft',
      nodes: 6,
      avgDuration: '1.2 min',
      successRate: 92,
      lastRun: '1 hour ago',
      runsToday: 156,
      tags: ['Support', 'AI']
    },
    {
      id: 'wf-5',
      name: 'Quality Assurance',
      description: 'Multi-stage QA with automated testing and approval',
      status: 'active',
      nodes: 10,
      avgDuration: '6.3 min',
      successRate: 98,
      lastRun: '8 min ago',
      runsToday: 32,
      tags: ['QA', 'Testing']
    },
    {
      id: 'wf-6',
      name: 'Lead Enrichment',
      description: 'Gather, verify, and score lead information',
      status: 'paused',
      nodes: 9,
      avgDuration: '3.8 min',
      successRate: 91,
      lastRun: '2 hours ago',
      runsToday: 12,
      tags: ['Sales', 'CRM']
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'draft':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'paused':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground mt-1">Design and orchestrate AI-powered processes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button className="bg-gradient-to-r from-accent to-accent/80">
            <Workflow className="mr-2 h-4 w-4" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
            <p className="text-xs text-muted-foreground">4 active, 1 draft, 1 paused</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">287</div>
            <p className="text-xs text-emerald-600">+42 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">93.3%</div>
            <p className="text-xs text-emerald-600">+1.2% improvement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.1 min</div>
            <p className="text-xs text-muted-foreground">Across all workflows</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-all border-border/50 hover:border-primary/50 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <GitBranch className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">ID: {workflow.id}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {workflow.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getStatusColor(workflow.status)}>
                  {workflow.status}
                </Badge>
                {workflow.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-muted/50">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Nodes</p>
                  <p className="text-sm font-semibold mt-1">{workflow.nodes}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-sm font-semibold mt-1">{workflow.successRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Duration</p>
                  <p className="text-sm font-semibold mt-1">{workflow.avgDuration}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Run</p>
                  <p className="text-sm font-semibold mt-1">{workflow.lastRun}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Runs Today</p>
                <p className="text-2xl font-bold">{workflow.runsToday}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Play className="mr-1 h-3 w-3" />
                  Run
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Builder Preview */}
      <Card className="border-2 border-dashed border-border/50 hover:border-accent/50 transition-colors">
        <CardHeader>
          <CardTitle>Visual Workflow Builder</CardTitle>
          <CardDescription>Drag-and-drop interface for designing AI workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <GitBranch className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Builder UI coming soon</p>
              <p className="text-xs text-muted-foreground">Drag nodes, connect edges, configure agents</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
