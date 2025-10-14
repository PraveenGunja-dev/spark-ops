import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function MaestroGovernance() {
  const policies = [
    {
      id: 'pol-1',
      name: 'Data Privacy Compliance',
      description: 'Ensure all agents comply with GDPR and CCPA regulations',
      status: 'active',
      type: 'Compliance',
      lastUpdated: '2025-10-10',
      violations: 0
    },
    {
      id: 'pol-2',
      name: 'Budget Control',
      description: 'Limit agent spending to predefined budgets',
      status: 'active',
      type: 'Financial',
      lastUpdated: '2025-10-12',
      violations: 2
    },
    {
      id: 'pol-3',
      name: 'PII Redaction',
      description: 'Automatically redact personally identifiable information',
      status: 'active',
      type: 'Security',
      lastUpdated: '2025-10-14',
      violations: 0
    },
    {
      id: 'pol-4',
      name: 'Human Approval Required',
      description: 'Require human approval for high-risk actions',
      status: 'draft',
      type: 'Approval',
      lastUpdated: '2025-10-13',
      violations: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'violated':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Governance & Policies</h1>
          <p className="text-muted-foreground mt-1">Safety rules, access control, and compliance</p>
        </div>
        <Button className="gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Policy
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">All policies enforced</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-warning">-1 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-success">+0.3% improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Policy List */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Rules</CardTitle>
          <CardDescription>Active governance policies and compliance rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{policy.name}</h3>
                    <Badge variant="outline" className={getStatusColor(policy.status)}>
                      {policy.status}
                    </Badge>
                    <Badge variant="outline" className="bg-muted/50">
                      {policy.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{policy.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Last updated: {policy.lastUpdated}</span>
                    <span>Violations: {policy.violations}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Logs</CardTitle>
          <CardDescription>Recent governance events and policy violations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
              <Clock className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm">PII redaction policy applied to run #8472</p>
                <p className="text-xs text-muted-foreground mt-1">2 min ago • Agent: Research Agent</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
              <AlertTriangle className="h-4 w-4 text-warning mt-1" />
              <div className="flex-1">
                <p className="text-sm">Budget limit exceeded for Content Generator</p>
                <p className="text-xs text-muted-foreground mt-1">15 min ago • Requires approval</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
              <AlertTriangle className="h-4 w-4 text-warning mt-1" />
              <div className="flex-1">
                <p className="text-sm">Unusual API usage detected by Data Analyzer</p>
                <p className="text-xs text-muted-foreground mt-1">1 hour ago • Security policy triggered</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
              <CheckCircle className="h-4 w-4 text-success mt-1" />
              <div className="flex-1">
                <p className="text-sm">Compliance check passed for Customer Support Bot</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago • GDPR policy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
