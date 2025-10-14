import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plug, 
  Plus, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Database,
  MessageSquare,
  FileText,
  Settings,
  Code
} from 'lucide-react';

export default function MaestroIntegrations() {
  const integrations = [
    {
      id: 'int-1',
      name: 'LangChain',
      description: 'Framework for developing applications powered by language models',
      status: 'active',
      category: 'Framework',
      version: '0.3.5',
      lastSync: '2 min ago'
    },
    {
      id: 'int-2',
      name: 'CrewAI',
      description: 'Framework for orchestrating role-playing AI agents',
      status: 'active',
      category: 'Framework',
      version: '0.2.1',
      lastSync: '5 min ago'
    },
    {
      id: 'int-3',
      name: 'AutoGen',
      description: 'Framework for building LLM applications with multiple agents',
      status: 'active',
      category: 'Framework',
      version: '0.4.2',
      lastSync: '10 min ago'
    },
    {
      id: 'int-4',
      name: 'OpenAgents',
      description: 'Open-source agent framework with plugin architecture',
      status: 'pending',
      category: 'Framework',
      version: '1.0.0',
      lastSync: 'Never'
    },
    {
      id: 'int-5',
      name: 'Salesforce CRM',
      description: 'Customer relationship management system',
      status: 'active',
      category: 'CRM',
      version: 'API v58',
      lastSync: '1 min ago'
    },
    {
      id: 'int-6',
      name: 'Slack',
      description: 'Team communication and collaboration platform',
      status: 'active',
      category: 'Communication',
      version: 'API v3',
      lastSync: 'Just now'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Framework':
        return <Code className="h-4 w-4" />;
      case 'CRM':
        return <Database className="h-4 w-4" />;
      case 'Communication':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Plug className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">Connect external services and APIs</p>
        </div>
        <Button className="gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Setup</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Requires configuration</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Framework, CRM, Communication</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration List */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Services</CardTitle>
          <CardDescription>Manage your integrated platforms and APIs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <Plug className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{integration.name}</h3>
                      <Badge variant="outline" className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Badge variant="outline" className="bg-muted/50">
                        {integration.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Version: {integration.version}</span>
                      <span>Last sync: {integration.lastSync}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API & Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle>API & Webhooks</CardTitle>
          <CardDescription>Programmatic access and event notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border/50 hover:border-accent/50 transition-colors">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                REST API
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Access Maestro programmatically</p>
              <Button variant="outline" size="sm" className="mt-3">
                View Documentation
              </Button>
            </div>
            <div className="p-4 rounded-lg border border-border/50 hover:border-accent/50 transition-colors">
              <h3 className="font-medium flex items-center gap-2">
                <Plug className="h-4 w-4" />
                Webhooks
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Receive real-time event notifications</p>
              <Button variant="outline" size="sm" className="mt-3">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
