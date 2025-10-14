import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mockProjects, mockUsers } from '@/lib/mockData';
import { User, Building, Key, Bell, Palette, Users, CreditCard, Globe, Check } from 'lucide-react';

// Mock tenant data
const mockTenants = [
  { id: 't-1', name: 'Acme Corporation', slug: 'acme', status: 'active', createdAt: '2025-01-15' },
  { id: 't-2', name: 'Globex Inc', slug: 'globex', status: 'active', createdAt: '2025-03-22' },
  { id: 't-3', name: 'Wayne Enterprises', slug: 'wayne', status: 'suspended', createdAt: '2025-05-10' },
];

// Mock subscription plans
const subscriptionPlans = [
  { id: 'basic', name: 'Basic', price: '$299/month', features: ['Up to 10 agents', '100K tokens/month', 'Basic support'] },
  { id: 'pro', name: 'Professional', price: '$799/month', features: ['Up to 50 agents', '1M tokens/month', 'Priority support', 'Custom integrations'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Unlimited agents', 'Unlimited tokens', '24/7 support', 'SLA guarantee', 'Dedicated account manager'] },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('tenants');
  
  // Tenant settings state
  const [selectedTenant, setSelectedTenant] = useState(mockTenants[0]?.id || '');
  const [tenantName, setTenantName] = useState('Acme Corporation');
  const [tenantSlug, setTenantSlug] = useState('acme');
  const [subscriptionPlan, setSubscriptionPlan] = useState('pro');
  
  // General settings state
  const [organizationName, setOrganizationName] = useState('UIPath Labs');
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [webhookNotifications, setWebhookNotifications] = useState(true);
  
  // Appearance settings state
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  
  // Project settings state
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]?.id || '');
  
  // User management state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('developer');
  
  const handleSaveTenant = () => {
    // In a real app, this would save to an API
    console.log('Tenant settings saved');
  };
  
  const handleSaveGeneral = () => {
    // In a real app, this would save to an API
    console.log('General settings saved');
  };
  
  const handleSaveNotifications = () => {
    // In a real app, this would save to an API
    console.log('Notification settings saved');
  };
  
  const handleSaveAppearance = () => {
    // In a real app, this would save to an API
    console.log('Appearance settings saved');
  };
  
  const handleInviteUser = () => {
    // In a real app, this would save to an API
    console.log('User invited');
    setNewUserEmail('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your multi-tenant orchestration platform</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="secrets">Secrets</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Tenant Management
              </CardTitle>
              <CardDescription>Manage your client tenants and their settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Tenant</Label>
                  <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name} ({tenant.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {mockTenants.find(t => t.id === selectedTenant) && (
                  <div className="rounded-lg border p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">
                        {mockTenants.find(t => t.id === selectedTenant)?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {mockTenants.find(t => t.id === selectedTenant)?.id} | 
                        Created: {new Date(mockTenants.find(t => t.id === selectedTenant)?.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tenant-name">Tenant Name</Label>
                        <Input
                          id="tenant-name"
                          value={tenantName}
                          onChange={(e) => setTenantName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tenant-slug">Tenant Slug</Label>
                        <Input
                          id="tenant-slug"
                          value={tenantSlug}
                          onChange={(e) => setTenantSlug(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tenant-description">Description</Label>
                      <Textarea
                        id="tenant-description"
                        placeholder="Describe this tenant and its purpose"
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <h4 className="font-medium">Tenant Status</h4>
                        <p className="text-sm text-muted-foreground">
                          {mockTenants.find(t => t.id === selectedTenant)?.status === 'active' 
                            ? 'Tenant is active and can access services' 
                            : 'Tenant is suspended and cannot access services'}
                        </p>
                      </div>
                      <Switch 
                        checked={mockTenants.find(t => t.id === selectedTenant)?.status === 'active'} 
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveTenant}>Save Changes</Button>
                      <Button variant="outline">Suspend Tenant</Button>
                      <Button variant="destructive">Delete Tenant</Button>
                    </div>
                  </div>
                )}
                
                <Separator />
                <Button variant="outline">Create New Tenant</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>Manage your subscription plans and billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4">Current Plan</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Professional Plan</h4>
                      <p className="text-sm text-muted-foreground">$799/month</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm"><span className="font-medium">Next billing date:</span> November 1, 2025</p>
                    <p className="text-sm"><span className="font-medium">Payment method:</span> Visa ending in 4242</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Available Plans</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subscriptionPlans.map((plan) => (
                      <Card key={plan.id} className={plan.id === subscriptionPlan ? 'border-primary' : ''}>
                        <CardHeader>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>{plan.price}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <Check className="h-4 w-4 mr-2 text-primary" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button 
                            className="w-full mt-4" 
                            variant={plan.id === subscriptionPlan ? 'default' : 'outline'}
                            onClick={() => setSubscriptionPlan(plan.id)}
                          >
                            {plan.id === subscriptionPlan ? 'Current Plan' : 'Select Plan'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <Separator />
                <div className="flex gap-2">
                  <Button>Update Payment Method</Button>
                  <Button variant="outline">View Billing History</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>Manage your platform preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Manage your projects and environments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Project</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {mockProjects.find(p => p.id === selectedProject) && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <h3 className="font-medium">
                      {mockProjects.find(p => p.id === selectedProject)?.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Slug</p>
                        <p>{mockProjects.find(p => p.id === selectedProject)?.slug}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p>{new Date(mockProjects.find(p => p.id === selectedProject)?.createdAt || '').toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Owner</p>
                        <p>
                          {mockUsers.find(u => u.id === mockProjects.find(p => p.id === selectedProject)?.ownerUserId)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Archive</Button>
                    </div>
                  </div>
                )}
                
                <Separator />
                <Button variant="outline">Create New Project</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users & Roles
              </CardTitle>
              <CardDescription>Manage team members and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                    <div>User</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Actions</div>
                  </div>
                  {mockUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                      <div className="font-medium">{user.name}</div>
                      <div>{user.email}</div>
                      <div>
                        <Select defaultValue={user.role}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="user@example.com" 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInviteUser}>Invite User</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Slack Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive notifications in Slack</p>
                  </div>
                  <Switch checked={slackNotifications} onCheckedChange={setSlackNotifications} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Webhook Notifications</h3>
                    <p className="text-sm text-muted-foreground">Send notifications to webhook endpoints</p>
                  </div>
                  <Switch checked={webhookNotifications} onCheckedChange={setWebhookNotifications} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Tenant Alerts</h3>
                    <p className="text-sm text-muted-foreground">Receive alerts for tenant issues</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleSaveAppearance}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="secrets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Secrets
              </CardTitle>
              <CardDescription>Manage API keys and environment variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-3 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                    <div>Name</div>
                    <div>Environment</div>
                    <div>Last Updated</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-4 items-center">
                    <div>
                      <p className="font-medium">DATABASE_URL</p>
                      <p className="text-sm text-muted-foreground">PostgreSQL connection string</p>
                    </div>
                    <div>Production</div>
                    <div>2025-10-10</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-4 items-center">
                    <div>
                      <p className="font-medium">API_KEY</p>
                      <p className="text-sm text-muted-foreground">Third-party service key</p>
                    </div>
                    <div>Staging</div>
                    <div>2025-10-12</div>
                  </div>
                </div>
                <Separator />
                <Button variant="outline">Add Secret</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}