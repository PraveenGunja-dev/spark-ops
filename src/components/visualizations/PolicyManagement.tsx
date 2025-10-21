/**
 * Policy Management UI
 * Policy rule builder, violation tracking, and budget allocation
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PolicyRule {
  id: string;
  name: string;
  type: 'budget' | 'approval' | 'security' | 'compliance';
  condition: string;
  action: string;
  enabled: boolean;
  priority: number;
}

interface PolicyViolation {
  id: string;
  policyId: string;
  policyName: string;
  runId: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved';
  description: string;
}

interface BudgetAllocation {
  id: string;
  name: string;
  teamId: string;
  allocated: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly';
  alertThreshold: number;
}

interface PolicyManagementProps {
  policies?: PolicyRule[];
  violations?: PolicyViolation[];
  budgets?: BudgetAllocation[];
  className?: string;
}

/**
 * Policy Management Component
 */
export function PolicyManagement({
  policies = [],
  violations = [],
  budgets = [],
  className,
}: PolicyManagementProps) {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className={cn('space-y-6', className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Policy Rules</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        {/* Policy Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Policy Rules</CardTitle>
                  <CardDescription>Configure governance and safety policies</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div
                    key={policy.id}
                    className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{policy.name}</span>
                          <Badge
                            variant={
                              policy.type === 'security'
                                ? 'destructive'
                                : policy.type === 'budget'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {policy.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Priority: {policy.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <strong>Condition:</strong> {policy.condition}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Action:</strong> {policy.action}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={policy.enabled} />
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {policies.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No policy rules configured</p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first policy
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Policy Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Policy</CardTitle>
              <CardDescription>Build custom governance rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Policy Name</Label>
                    <Input placeholder="e.g., Budget Limit Check" />
                  </div>
                  <div>
                    <Label>Policy Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget Control</SelectItem>
                        <SelectItem value="approval">Approval Required</SelectItem>
                        <SelectItem value="security">Security Check</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Condition</Label>
                  <Input placeholder="e.g., cost > 100 OR sensitive_data == true" />
                </div>

                <div>
                  <Label>Action</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block execution</SelectItem>
                      <SelectItem value="approve">Require approval</SelectItem>
                      <SelectItem value="notify">Send notification</SelectItem>
                      <SelectItem value="log">Log violation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch id="enabled" />
                    <Label htmlFor="enabled">Enable policy</Label>
                  </div>
                  <Button>Save Policy</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Violations</CardTitle>
              <CardDescription>Track and resolve policy breaches</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Run ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell>
                        <Badge
                          variant={
                            violation.severity === 'critical'
                              ? 'destructive'
                              : violation.severity === 'high'
                              ? 'destructive'
                              : violation.severity === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {violation.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{violation.policyName}</TableCell>
                      <TableCell className="font-mono text-sm">{violation.runId}</TableCell>
                      <TableCell>{new Date(violation.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            violation.status === 'resolved'
                              ? 'default'
                              : violation.status === 'acknowledged'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {violation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {violations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-success" />
                  <p>No policy violations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Budget Allocation</CardTitle>
                  <CardDescription>Manage spending limits per team</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const percentage = (budget.spent / budget.allocated) * 100;
                  const isOverBudget = percentage > 100;
                  const isNearLimit = percentage > budget.alertThreshold;

                  return (
                    <div key={budget.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{budget.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {budget.period} budget
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${budget.spent.toFixed(2)} / ${budget.allocated.toFixed(2)}
                          </div>
                          <div
                            className={cn(
                              'text-sm',
                              isOverBudget
                                ? 'text-destructive'
                                : isNearLimit
                                ? 'text-warning'
                                : 'text-success'
                            )}
                          >
                            {percentage.toFixed(1)}% used
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full transition-all',
                              isOverBudget
                                ? 'bg-destructive'
                                : isNearLimit
                                ? 'bg-warning'
                                : 'bg-success'
                            )}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div
                          className="absolute top-0 w-0.5 h-4 bg-warning"
                          style={{ left: `${budget.alertThreshold}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Alert at {budget.alertThreshold}%</span>
                        {isOverBudget && (
                          <span className="text-destructive flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Over budget
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>Configure human-in-the-loop approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-warning" />
                    <span className="font-medium">Pending Approvals: 3</span>
                  </div>
                  <div className="space-y-2">
                    {['Run #1234', 'Run #1235', 'Run #1236'].map((run) => (
                      <div
                        key={run}
                        className="flex items-center justify-between p-3 bg-muted rounded"
                      >
                        <span className="text-sm">{run} - High cost operation</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Reject
                          </Button>
                          <Button size="sm">Approve</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success">127</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Approved this month
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-destructive">12</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Rejected this month
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
