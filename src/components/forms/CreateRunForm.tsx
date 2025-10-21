/**
 * Reusable Form Component with Validation
 * Example: Create Run Form
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createRunSchema, CreateRunFormData } from '@/lib/validation';
import { useCreateRun } from '@/hooks/use-runs';
import { toast } from '@/hooks/use-toast';

interface CreateRunFormProps {
  workflows: Array<{ id: string; name: string }>;
  agents: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Form component for creating a new run
 * 
 * @example
 * ```tsx
 * <CreateRunForm
 *   workflows={workflows}
 *   agents={agents}
 *   onSuccess={() => console.log('Run created!')}
 * />
 * ```
 */
export function CreateRunForm({ workflows, agents, onSuccess, onCancel }: CreateRunFormProps) {
  const { mutate: createRun, isPending } = useCreateRun();

  const form = useForm<CreateRunFormData>({
    resolver: zodResolver(createRunSchema),
    defaultValues: {
      workflowId: '',
      agentId: '',
      env: 'dev',
      trigger: 'manual',
    },
  });

  function onSubmit(data: CreateRunFormData) {
    createRun(data, {
      onSuccess: () => {
        toast({
          title: 'Run created',
          description: 'Your workflow run has been started successfully.',
        });
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: 'Error creating run',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="workflowId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a workflow" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the workflow you want to execute
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The AI agent that will execute this workflow
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="env"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Environment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="dev">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="prod">Production</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Environment where the run will execute
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Run'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
