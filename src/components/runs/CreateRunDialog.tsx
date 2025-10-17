/**
 * Create Run Dialog Component
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateRun } from '@/hooks/useRuns';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useAgents } from '@/hooks/useAgents';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CreateRunDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { selectedProjectId } = useProject();
  const createRun = useCreateRun();

  // Form state
  const [workflowId, setWorkflowId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [env, setEnv] = useState<'dev' | 'staging' | 'prod'>('dev');
  const [trigger, setTrigger] = useState('manual');
  const [inputData, setInputData] = useState('{}');

  // Fetch workflows and agents for selection
  const { data: workflowsData } = useWorkflows(selectedProjectId || '', 1, 100);
  const { data: agentsData } = useAgents(selectedProjectId || '', 1, 100);

  const workflows = workflowsData?.items || [];
  const agents = agentsData?.items || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }

    if (!workflowId) {
      toast.error('Please select a workflow');
      return;
    }

    if (!agentId) {
      toast.error('Please select an agent');
      return;
    }

    // Validate JSON input
    let parsedInput: Record<string, any> = {};
    try {
      parsedInput = JSON.parse(inputData);
    } catch (error) {
      toast.error('Invalid JSON in input data');
      return;
    }

    try {
      const run = await createRun.mutateAsync({
        workflow_id: workflowId,
        agent_id: agentId,
        env,
        trigger,
        input_data: parsedInput,
      });

      toast.success('Run started successfully');
      setOpen(false);
      
      // Reset form
      setWorkflowId('');
      setAgentId('');
      setEnv('dev');
      setTrigger('manual');
      setInputData('{}');

      // Navigate to run details
      navigate(`/runs/${run.id}`);
    } catch (error) {
      console.error('Failed to create run:', error);
      toast.error('Failed to start run. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Start New Run
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start New Run</DialogTitle>
          <DialogDescription>
            Execute a workflow with an agent
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workflow Selection */}
          <div className="space-y-2">
            <Label htmlFor="workflow">
              Workflow <span className="text-destructive">*</span>
            </Label>
            <Select value={workflowId} onValueChange={setWorkflowId} required>
              <SelectTrigger id="workflow">
                <SelectValue placeholder="Select workflow to execute" />
              </SelectTrigger>
              <SelectContent>
                {workflows.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No workflows available
                  </div>
                ) : (
                  workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                      {workflow.tags.length > 0 && (
                        <span className="text-muted-foreground ml-2">
                          ({workflow.tags.join(', ')})
                        </span>
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Agent Selection */}
          <div className="space-y-2">
            <Label htmlFor="agent">
              Agent <span className="text-destructive">*</span>
            </Label>
            <Select value={agentId} onValueChange={setAgentId} required>
              <SelectTrigger id="agent">
                <SelectValue placeholder="Select agent to execute workflow" />
              </SelectTrigger>
              <SelectContent>
                {agents.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No agents available
                  </div>
                ) : (
                  agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                      <span className="text-muted-foreground ml-2">
                        ({agent.model} - {agent.env})
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <Label htmlFor="env">
              Environment <span className="text-destructive">*</span>
            </Label>
            <Select
              value={env}
              onValueChange={(value) => setEnv(value as 'dev' | 'staging' | 'prod')}
              required
            >
              <SelectTrigger id="env">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="prod">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trigger Type */}
          <div className="space-y-2">
            <Label htmlFor="trigger">Trigger Type</Label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger id="trigger">
                <SelectValue placeholder="Select trigger type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="schedule">Scheduled</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Input Data (JSON) */}
          <div className="space-y-2">
            <Label htmlFor="inputData">Input Data (JSON)</Label>
            <Textarea
              id="inputData"
              placeholder='{"key": "value"}'
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Provide input parameters for the workflow as JSON
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRun.isPending}>
              {createRun.isPending ? 'Starting...' : 'Start Run'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
