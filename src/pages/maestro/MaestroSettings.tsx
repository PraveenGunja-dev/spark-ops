import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Save,
  RotateCcw
} from 'lucide-react';
import { useState } from 'react';

export default function MaestroSettings() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoScaling: true,
    darkMode: false,
    budgetAlerts: true,
    autoApprovals: false,
    dataRetention: 30,
    maxConcurrentRuns: 10,
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Settings saved:', settings);
  };

  const handleReset = () => {
    setSettings({
      notifications: true,
      autoScaling: true,
      darkMode: false,
      budgetAlerts: true,
      autoApprovals: false,
      dataRetention: 30,
      maxConcurrentRuns: 10,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Maestro Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your agentic orchestration preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start font-normal bg-accent/10 text-accent border border-accent/20">
                <Settings className="mr-2 h-4 w-4" />
                General
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <Database className="mr-2 h-4 w-4" />
                Data & Storage
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic configuration for your Maestro environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Scaling</Label>
                  <p className="text-sm text-muted-foreground">Automatically adjust agent capacity based on workload</p>
                </div>
                <Switch 
                  checked={settings.autoScaling} 
                  onCheckedChange={(checked) => setSettings({...settings, autoScaling: checked})} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark color scheme for the interface</p>
                </div>
                <Switch 
                  checked={settings.darkMode} 
                  onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Approvals</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve low-risk agent actions</p>
                </div>
                <Switch 
                  checked={settings.autoApprovals} 
                  onCheckedChange={(checked) => setSettings({...settings, autoApprovals: checked})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Max Concurrent Runs</Label>
                <Input 
                  type="number" 
                  value={settings.maxConcurrentRuns} 
                  onChange={(e) => setSettings({...settings, maxConcurrentRuns: parseInt(e.target.value)})}
                  className="w-32"
                />
                <p className="text-sm text-muted-foreground">Maximum number of workflows that can run simultaneously</p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email updates for important events</p>
                </div>
                <Switch 
                  checked={settings.notifications} 
                  onCheckedChange={(checked) => setSettings({...settings, notifications: checked})} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Budget Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when approaching budget limits</p>
                </div>
                <Switch 
                  checked={settings.budgetAlerts} 
                  onCheckedChange={(checked) => setSettings({...settings, budgetAlerts: checked})} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Storage</CardTitle>
              <CardDescription>Manage data retention and storage preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Data Retention Period</Label>
                <Input 
                  type="number" 
                  value={settings.dataRetention} 
                  onChange={(e) => setSettings({...settings, dataRetention: parseInt(e.target.value)})}
                  className="w-32"
                />
                <p className="text-sm text-muted-foreground">Days to retain run data and logs (0 for indefinite)</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleSave} className="gradient-primary">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}