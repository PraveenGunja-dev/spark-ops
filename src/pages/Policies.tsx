import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Switch
} from '@/components/ui/switch';
import { 
  Input
} from '@/components/ui/input';
import { 
  Label
} from '@/components/ui/label';
import { 
  Textarea
} from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, Eye, Edit, Plus, Bell } from 'lucide-react';

// Mock policy data
const budgetPolicies = [
  {
    id: '1',
    name: 'Research Team Budget',
    tenant: 'Research',
    ceiling: 5000,
    used: 3250,
    alerts: [80, 100],
    status: 'active',
  },
  {
    id: '2',
    name: 'Marketing Campaign Budget',
    tenant: 'Marketing',
    ceiling: 10000,
    used: 7850,
    alerts: [80, 100],
    status: 'active',
  },
  {
    id: '3',
    name: 'Support Operations Budget',
    tenant: 'Support',
    ceiling: 2500,
    used: 1200,
    alerts: [80, 100],
    status: 'active',
  },
];

const safetyPolicies = [
  {
    id: '1',
    name: 'PII Redaction Policy',
    description: 'Automatically redact personally identifiable information',
    enabled: true,
    scope: 'All Agents',
  },
  {
    id: '2',
    name: 'External Tool Allowlist',
    description: 'Restrict agents to approved external tools only',
    enabled: true,
    scope: 'Production',
  },
  {
    id: '3',
    name: 'Model Constraint Policy',
    description: 'Limit agents to specific model providers',
    enabled: false,
    scope: 'All Agents',
  },
];

const approvalRules = [
  {
    id: '1',
    name: 'High-Value Invoice Approval',
    condition: 'Invoice amount > $1000',
    action: 'Require human approval',
    scope: 'All Tenants',
  },
  {
    id: '2',
    name: 'Content Moderation',
    condition: 'Generated content contains sensitive topics',
    action: 'Require human review',
    scope: 'Marketing',
  },
];

const auditLogs = [
  {
    id: '1',
    timestamp: '2025-10-14T09:30:00Z',
    user: 'Ada Admin',
    action: 'Budget policy updated',
    resource: 'Research Team Budget',
    status: 'success',
  },
  {
    id: '2',
    timestamp: '2025-10-14T08:45:00Z',
    user: 'Mike Chen',
    action: 'PII policy violation',
    resource: 'ResearchAgent run #r-10042',
    status: 'violation',
  },
  {
    id: '3',
    timestamp: '2025-10-14T07:20:00Z',
    user: 'Sarah Smith',
    action: 'Approval rule created',
    resource: 'Content Moderation',
    status: 'success',
  },
  {
    id: '4',
    timestamp: '2025-10-14T06:15:00Z',
    user: 'System',
    action: 'Budget threshold alert',
    resource: 'Marketing Campaign Budget',
    status: 'alert',
  },
];

export default function Policies() {
  const [budgets, setBudgets] = useState(budgetPolicies);
  const [safety, setSafety] = useState(safetyPolicies);
  const [rules, setRules] = useState(approvalRules);
  const [activeTab, setActiveTab] = useState('budgets');

  const toggleSafetyPolicy = (id: string) => {
    setSafety(safety.map(policy => 
      policy.id === id 
        ? { ...policy, enabled: !policy.enabled } 
        : policy
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Policies & Governance</h1>
        <p className="text-muted-foreground">Manage safety, compliance, and budgets</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="safety">Safety Policies</TabsTrigger>
          <TabsTrigger value="approvals">Approval Rules</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>
                Set cost ceilings and configure alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget) => (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">{budget.name}</TableCell>
                      <TableCell>{budget.tenant}</TableCell>
                      <TableCell>${budget.ceiling.toLocaleString()}</TableCell>
                      <TableCell>${budget.used.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-24 mr-2">
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${(budget.used / budget.ceiling) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm">
                            {Math.round((budget.used / budget.ceiling) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Badge variant={budget.used / budget.ceiling > 0.8 ? "destructive" : "default"}>
                            {budget.used / budget.ceiling > 0.8 ? "Warning" : "Normal"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${budgets.reduce((sum, budget) => sum + budget.ceiling, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Across all tenants</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${budgets.reduce((sum, budget) => sum + budget.used, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">This billing cycle</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alerts Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {auditLogs.filter(log => log.status === 'alert').length}
                </div>
                <p className="text-sm text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Safety Policies</CardTitle>
              <CardDescription>
                Configure security and compliance policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safety.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{policy.name}</h3>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline">{policy.scope}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={policy.enabled} 
                        onCheckedChange={() => toggleSafetyPolicy(policy.id)} 
                      />
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Create New Policy</CardTitle>
              <CardDescription>
                Define a new safety or compliance policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-name">Policy Name</Label>
                  <Input id="policy-name" placeholder="Enter policy name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy-scope">Scope</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      <SelectItem value="production">Production Only</SelectItem>
                      <SelectItem value="research">Research Team</SelectItem>
                      <SelectItem value="marketing">Marketing Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="policy-description">Description</Label>
                  <Textarea 
                    id="policy-description" 
                    placeholder="Describe the policy and its purpose" 
                    className="min-h-[100px]" 
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Rules</CardTitle>
              <CardDescription>
                Define conditions requiring human approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{rule.condition}</TableCell>
                      <TableCell>{rule.action}</TableCell>
                      <TableCell>{rule.scope}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Create Approval Rule</CardTitle>
              <CardDescription>
                Define a new condition requiring human intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input id="rule-name" placeholder="Enter rule name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-scope">Scope</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tenants</SelectItem>
                      <SelectItem value="research">Research Team</SelectItem>
                      <SelectItem value="marketing">Marketing Team</SelectItem>
                      <SelectItem value="support">Support Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="rule-condition">Condition</Label>
                  <Textarea 
                    id="rule-condition" 
                    placeholder="Define the condition that triggers this rule (e.g., 'Invoice amount > $1000')" 
                    className="min-h-[80px]" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="rule-action">Action</Label>
                  <Textarea 
                    id="rule-action" 
                    placeholder="Define the required action (e.g., 'Require human approval')" 
                    className="min-h-[80px]" 
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Time-sorted list of policy violations and overrides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            log.status === 'success' ? 'default' : 
                            log.status === 'violation' ? 'destructive' : 'secondary'
                          }
                        >
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Governance Summary</CardTitle>
              <CardDescription>
                Compliance metrics and policy coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">94%</div>
                  <div className="text-sm text-muted-foreground">Compliance Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">87%</div>
                  <div className="text-sm text-muted-foreground">Policy Coverage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Active Policies</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}