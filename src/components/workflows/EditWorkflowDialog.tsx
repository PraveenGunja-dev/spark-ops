/**
 * Edit Workflow Dialog Component  
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
import { Textarea } from '@/components/ui/textarea';
import { useUpdateWorkflow } from '@/hooks/useWorkflows';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import type { Workflow } from '@/lib/types';

interface EditWorkflowDialogProps {
  workflow: Workflow;
  trigger?: React.ReactNode;
}

export function EditWorkflowDialog({ workflow, trigger }: EditWorkflowDialogProps) {
  const [open, setOpen] = useState(false);
  const updateWorkflow = useUpdateWorkflow();

  // Form state
  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(workflow.tags.join(', '));

  // Reset form when workflow changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(workflow.name);
      setDescription('');
      setTags(workflow.tags.join(', '));
    }
  }, [open, workflow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Workflow name is required');
      return;
    }

    try {
      await updateWorkflow.mutateAsync({
        id: workflow.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        },
      });

      toast.success(`Workflow "${name}" updated successfully`);
      setOpen(false);
    } catch (error) {
      console.error('Failed to update workflow:', error);
      toast.error('Failed to update workflow. Please try again.');
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Workflow</DialogTitle>
          <DialogDescription>
            Update workflow details and metadata
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workflow Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Workflow Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Customer Onboarding"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this workflow does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="automation, customer, onboarding (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
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
            <Button type="submit" disabled={updateWorkflow.isPending}>
              {updateWorkflow.isPending ? 'Updating...' : 'Update Workflow'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
