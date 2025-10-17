/**
 * Edit Agent Dialog Component
 */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { useUpdateAgent } from '@/hooks/useAgents';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import type { Agent } from '@/lib/types';

interface EditAgentDialogProps {
  agent: Agent;
  trigger?: React.ReactNode;
}

export function EditAgentDialog({ agent, trigger }: EditAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const updateAgent = useUpdateAgent();

  // Form state - initialize with agent data
  const [name, setName] = useState(agent.name);
  const [runtime, setRuntime] = useState<'python' | 'node'>(agent.runtime);
  const [model, setModel] = useState(agent.model);
  const [provider, setProvider] = useState('');
  const [temperature, setTemperature] = useState('0.7');
  const [env, setEnv] = useState<'dev' | 'staging' | 'prod'>(agent.env);
  const [concurrency, setConcurrency] = useState(agent.concurrency?.toString() || '5');
  const [promptSummary, setPromptSummary] = useState(agent.promptSummary || '');

  // Reset form when agent changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(agent.name);
      setRuntime(agent.runtime);
      setModel(agent.model);
      setProvider('');
      setTemperature('0.7');
      setEnv(agent.env);
      setConcurrency(agent.concurrency?.toString() || '5');
      setPromptSummary(agent.promptSummary || '');
    }
  }, [open, agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Agent name is required');
      return;
    }

    const tempValue = parseFloat(temperature);
    if (isNaN(tempValue) || tempValue < 0 || tempValue > 2) {
      toast.error('Temperature must be between 0 and 2');
      return;
    }

    const concurrencyValue = parseInt(concurrency);
    if (isNaN(concurrencyValue) || concurrencyValue < 1) {
      toast.error('Concurrency must be at least 1');
      return;
    }

    try {
      await updateAgent.mutateAsync({
        id: agent.id,
        data: {
          name: name.trim(),
          runtime: runtime as 'python' | 'node',
          model,
          provider,
          temperature: tempValue,
          env: env as 'dev' | 'staging' | 'prod',
          concurrency: concurrencyValue,
          promptSummary: promptSummary.trim() || undefined,
        },
      });

      toast.success(`Agent "${name}" updated successfully`);
      setOpen(false);
    } catch (error) {
      console.error('Failed to update agent:', error);
      toast.error('Failed to update agent. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>
            Update agent configuration and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agent Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Agent Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., ResearchAgent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Runtime */}
          <div className="space-y-2">
            <Label htmlFor="runtime">
              Runtime <span className="text-destructive">*</span>
            </Label>
            <Select value={runtime} onValueChange={(value) => setRuntime(value as 'python' | 'node')} required>
              <SelectTrigger id="runtime">
                <SelectValue placeholder="Select runtime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="node">Node.js</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="model">
              Model <span className="text-destructive">*</span>
            </Label>
            <Select value={model} onValueChange={setModel} required>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <Label htmlFor="provider">
              Provider <span className="text-destructive">*</span>
            </Label>
            <Select value={provider} onValueChange={setProvider} required>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="azure">Azure OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (0-2)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Controls randomness. Lower = more focused, Higher = more creative
            </p>
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <Label htmlFor="env">
              Environment <span className="text-destructive">*</span>
            </Label>
            <Select value={env} onValueChange={(value) => setEnv(value as 'dev' | 'staging' | 'prod')} required>
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

          {/* Concurrency */}
          <div className="space-y-2">
            <Label htmlFor="concurrency">Max Concurrent Runs</Label>
            <Input
              id="concurrency"
              type="number"
              min="1"
              value={concurrency}
              onChange={(e) => setConcurrency(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of runs this agent can execute simultaneously
            </p>
          </div>

          {/* Prompt Summary */}
          <div className="space-y-2">
            <Label htmlFor="promptSummary">System Prompt</Label>
            <Textarea
              id="promptSummary"
              placeholder="Enter agent instructions..."
              value={promptSummary}
              onChange={(e) => setPromptSummary(e.target.value)}
              rows={4}
            />
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
            <Button type="submit" disabled={updateAgent.isPending}>
              {updateAgent.isPending ? 'Updating...' : 'Update Agent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
