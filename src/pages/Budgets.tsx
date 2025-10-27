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
import { DollarSign, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { usePolicies } from '@/hooks/usePolicies';

export default function Budgets() {
  const { currentProject } = useProject();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch budget policies
  const { data: policies = [], isLoading, error } = usePolicies(
    currentProject?.id || '', 
    { policy_type: 'budget' }
  );
  
  // Mock data for now - will be replaced with real data
  const budgetData = [
    {
      id: '1',
      name: 'Research Team Budget',
      team: 'Research',
      allocated: 5000,
      spent: 3250,
      period: 'monthly',
      alertThreshold: 80,
      status: 'active',
    },
    {
      id: '2',
      name: 'Marketing Campaign Budget',
      team: 'Marketing',
      allocated: 10000,
      spent: 7850,
      period: 'monthly',
      alertThreshold: 80,
      status: 'warning',
    },
    {
      id: '3',
      name: 'Support Operations Budget',
      team: 'Support',
      allocated: 2500,
      spent: 1200,
      period: 'monthly',
      alertThreshold: 80,
      status: 'active',
    },
  ];
  
  const budgetHistory = [
    {
      id: '1',
      budgetId: '1',
      date: '2025-10-01',
      amount: 1200,
      description: 'Research paper purchases',
      category: 'Research',
    },
    {
      id: '2',
      budgetId: '2',
      date: '2025-10-05',
      amount: 2500,
      description: 'Ad campaign launch',
      category: 'Marketing',
    },
    {
      id: '3',
      budgetId: '3',
      date: '2025-10-10',
      amount: 800,
      description: 'Customer support tools',
      category: 'Support',
    },
  ];
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground">Loading budget data...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground">Manage team budgets and spending</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500">Failed to load budget data</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <p className="text-muted-foreground">Manage team budgets and spending</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="history">Spending History</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${budgetData.reduce((sum, budget) => sum + budget.allocated, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Across all teams</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${budgetData.reduce((sum, budget) => sum + budget.spent, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">This period</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${(budgetData.reduce((sum, budget) => sum + budget.allocated, 0) - 
                    budgetData.reduce((sum, budget) => sum + budget.spent, 0)).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Available budget</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">
                  {budgetData.filter(b => b.status === 'warning').length}
                </div>
                <p className="text-sm text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization</CardTitle>
              <CardDescription>
                Current spending across all teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetData.map((budget) => {
                    const percentage = (budget.spent / budget.allocated) * 100;
                    const isOverBudget = percentage > 100;
                    const isNearLimit = percentage > budget.alertThreshold;
                    
                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.team}</TableCell>
                        <TableCell>${budget.allocated.toLocaleString()}</TableCell>
                        <TableCell>${budget.spent.toLocaleString()}</TableCell>
                        <TableCell>${(budget.allocated - budget.spent).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-24 mr-2">
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    isOverBudget ? 'bg-destructive' : 
                                    isNearLimit ? 'bg-warning' : 'bg-success'
                                  }`} 
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              isOverBudget ? 'destructive' : 
                              isNearLimit ? 'secondary' : 'default'
                            }
                          >
                            {isOverBudget ? 'Over Budget' : 
                             isNearLimit ? 'Near Limit' : 'On Track'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Budget Allocation</CardTitle>
                  <CardDescription>
                    Manage spending limits per team
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Budget
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Budget</DialogTitle>
                      <DialogDescription>
                        Set spending limits for a team or project
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget-name">Budget Name</Label>
                        <Input id="budget-name" placeholder="e.g., Research Team Budget" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget-team">Team</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="research">Research</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget-amount">Allocated Amount ($)</Label>
                        <Input id="budget-amount" type="number" placeholder="5000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget-period">Period</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="budget-alert">Alert Threshold (%)</Label>
                        <Input id="budget-alert" type="number" placeholder="80" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="budget-description">Description</Label>
                        <Textarea 
                          id="budget-description" 
                          placeholder="Describe the purpose of this budget" 
                          className="min-h-[80px]" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button>Create Budget</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetData.map((budget) => {
                    const percentage = (budget.spent / budget.allocated) * 100;
                    const isOverBudget = percentage > 100;
                    const isNearLimit = percentage > budget.alertThreshold;
                    
                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.name}</TableCell>
                        <TableCell>{budget.team}</TableCell>
                        <TableCell>${budget.allocated.toLocaleString()}</TableCell>
                        <TableCell>${budget.spent.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{budget.period}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              isOverBudget ? 'destructive' : 
                              isNearLimit ? 'secondary' : 'default'
                            }
                          >
                            {isOverBudget ? 'Over Budget' : 
                             isNearLimit ? 'Near Limit' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending History</CardTitle>
              <CardDescription>
                Detailed record of budget expenditures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">${item.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {budgetData.find(b => b.id === item.budgetId)?.name || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Alerts</CardTitle>
              <CardDescription>
                Notifications for budget thresholds and violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetData.filter(b => b.status === 'warning').map((budget) => (
                  <div key={budget.id} className="p-4 border rounded-lg bg-warning/10">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium">Budget Alert: {budget.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {budget.team} team has used {((budget.spent / budget.allocated) * 100).toFixed(1)}% 
                          of their {budget.period} budget (${budget.allocated.toLocaleString()})
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="warning">Warning</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                ))}
                
                {budgetData.filter(b => b.status === 'warning').length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-1">No Active Alerts</h3>
                    <p className="text-muted-foreground">
                      All budgets are within their allocated limits
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}