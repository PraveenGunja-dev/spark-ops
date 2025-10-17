/**
 * Edit Tool Dialog Component
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
import { useUpdateTool } from '@/hooks/useTools';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  kind: string;
  authType: string;
  rateLimitPerMin: number | null;
  description: string | null;
}

interface EditToolDialogProps {
  tool: Tool;
  trigger?: React.ReactNode;
}

export function EditToolDialog({ tool, trigger }: EditToolDialogProps) {
  const [open, setOpen] = useState(false);
  const updateTool = useUpdateTool(tool.id);

  // Form state
  const [name, setName] = useState(tool.name);
  const [kind, setKind] = useState(tool.kind);
  const [authType, setAuthType] = useState(tool.authType);
  const [description, setDescription] = useState(tool.description || '');
  const [rateLimitPerMin, setRateLimitPerMin] = useState(tool.rateLimitPerMin?.toString() || '');

  // Reset form when tool changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(tool.name);
      setKind(tool.kind);
      setAuthType(tool.authType);
      setDescription(tool.description || '');
      setRateLimitPerMin(tool.rateLimitPerMin?.toString() || '');
    }
  }, [open, tool]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Tool name is required');
      return;
    }

    if (!kind) {
      toast.error('Tool type is required');
      return;
    }

    if (!authType) {
      toast.error('Auth type is required');
      return;
    }

    try {
      await updateTool.mutateAsync({
        name: name.trim(),
        kind,
        authType,
        description: description.trim() || undefined,
        rateLimitPerMin: rateLimitPerMin ? parseInt(rateLimitPerMin) : undefined,
      });

      toast.success(`Tool "${name}" updated successfully`);
      setOpen(false);
    } catch (error) {
      console.error('Failed to update tool:', error);
      toast.error('Failed to update tool. Please try again.');
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
          <DialogTitle>Edit Tool</DialogTitle>
          <DialogDescription>
            Update tool configuration and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tool Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tool Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., GitHub API, Slack Webhook"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Tool Type */}
          <div className="space-y-2">
            <Label htmlFor="kind">
              Tool Type <span className="text-destructive">*</span>
            </Label>
            <Select value={kind} onValueChange={setKind} required>
              <SelectTrigger id="kind">
                <SelectValue placeholder="Select tool type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="function">Function</SelectItem>
                <SelectItem value="mcp">MCP Tool</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auth Type */}
          <div className="space-y-2">
            <Label htmlFor="authType">
              Authentication Type <span className="text-destructive">*</span>
            </Label>
            <Select value={authType} onValueChange={setAuthType} required>
              <SelectTrigger id="authType">
                <SelectValue placeholder="Select auth type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="oauth">OAuth 2.0</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rate Limit */}
          <div className="space-y-2">
            <Label htmlFor="rateLimitPerMin">Rate Limit (per minute)</Label>
            <Input
              id="rateLimitPerMin"
              type="number"
              placeholder="e.g., 100"
              value={rateLimitPerMin}
              onChange={(e) => setRateLimitPerMin(e.target.value)}
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for unlimited
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this tool does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
            <Button type="submit" disabled={updateTool.isPending}>
              {updateTool.isPending ? 'Updating...' : 'Update Tool'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
