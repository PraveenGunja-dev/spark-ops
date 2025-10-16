/**
 * Create Agent Dialog
 */
import { useState } from 'react';
import { useCreateAgent } from '@/hooks/useAgents';
import { useProject } from '@/contexts/ProjectContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Brain } from 'lucide-react';
import { toast } from 'sonner';

export function CreateAgentDialog() {
  const [open, setOpen] = useState(false);
  const { selectedProjectId } = useProject();
  const { mutate: createAgent, isPending } = useCreateAgent();

  const [formData, setFormData] = useState({
    name: '',
    runtime: 'python' as 'python' | 'node',
    model: 'gpt-4o',
    provider: 'openai',
    env: 'dev' as 'dev' | 'staging' | 'prod',
    temperature: 7,
    concurrency: 8,
    promptSummary: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }

    createAgent(
      {
        ...formData,
        projectId: selectedProjectId,
        tools: [],
        autoscale_min: 1,
        autoscale_max: 10,
        autoscale_target_cpu: 70,
      },
      {
        onSuccess: () => {
          toast.success('Agent created successfully!');
          setOpen(false);
          setFormData({
            name: '',
            runtime: 'python',
            model: 'gpt-4o',
            provider: 'openai',
            env: 'dev',
            temperature: 7,
            concurrency: 8,
            promptSummary: '',
          });
        },
        onError: (error: any) => {
          toast.error(`Failed to create agent: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Brain className="h-4 w-4 mr-2" />
          Create New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
            <DialogDescription>
              Configure a new AI agent for your project. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., ResearchAgent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="runtime">Runtime</Label>
                <Select
                  value={formData.runtime}
                  onValueChange={(value: 'python' | 'node') =>
                    setFormData({ ...formData, runtime: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="node">Node.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="env">Environment</Label>
                <Select
                  value={formData.env}
                  onValueChange={(value: 'dev' | 'staging' | 'prod') =>
                    setFormData({ ...formData, env: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="prod">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => setFormData({ ...formData, model: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="promptSummary">Prompt Summary</Label>
              <Input
                id="promptSummary"
                value={formData.promptSummary}
                onChange={(e) => setFormData({ ...formData, promptSummary: e.target.value })}
                placeholder="Brief description of agent's purpose"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="temperature">Temperature (0-10)</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="concurrency">Concurrency</Label>
                <Input
                  id="concurrency"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.concurrency}
                  onChange={(e) =>
                    setFormData({ ...formData, concurrency: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formData.name}>
              {isPending ? 'Creating...' : 'Create Agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
