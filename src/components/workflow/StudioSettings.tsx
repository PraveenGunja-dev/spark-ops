import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function StudioSettings() {
  // Workflow settings state
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('Description of my workflow');
  const [executionTimeout, setExecutionTimeout] = useState('300');
  const [maxRetries, setMaxRetries] = useState('3');
  const [concurrentRuns, setConcurrentRuns] = useState('5');
  const [autoRetry, setAutoRetry] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [logging, setLogging] = useState(true);

  const handleSaveSettings = () => {
    // In a real app, this would save to a backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow Settings</h1>
        <p className="text-muted-foreground">Configure workflow execution and behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic workflow configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Execution Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Execution</CardTitle>
            <CardDescription>Control how your workflow runs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="execution-timeout">Execution Timeout (seconds)</Label>
              <Input
                id="execution-timeout"
                type="number"
                value={executionTimeout}
                onChange={(e) => setExecutionTimeout(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-retries">Max Retries</Label>
              <Input
                id="max-retries"
                type="number"
                value={maxRetries}
                onChange={(e) => setMaxRetries(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="concurrent-runs">Concurrent Runs</Label>
              <Input
                id="concurrent-runs"
                type="number"
                value={concurrentRuns}
                onChange={(e) => setConcurrentRuns(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Behavior Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Behavior</CardTitle>
            <CardDescription>Workflow behavior and policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Retry</Label>
                <p className="text-sm text-muted-foreground">Automatically retry failed runs</p>
              </div>
              <Switch
                checked={autoRetry}
                onCheckedChange={setAutoRetry}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">Send notifications on workflow events</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Logging</Label>
                <p className="text-sm text-muted-foreground">Enable detailed execution logging</p>
              </div>
              <Switch
                checked={logging}
                onCheckedChange={setLogging}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card>
          <CardHeader>
            <CardTitle>Save Settings</CardTitle>
            <CardDescription>Apply and save your workflow configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSaveSettings} className="w-full">
              Save Workflow Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}