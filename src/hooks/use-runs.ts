/**
 * React Query hooks for Runs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { runsAPI, RunsListParams, CreateRunRequest } from '@/lib/api/runs';
import { Run } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

// Query keys
export const runsKeys = {
  all: ['runs'] as const,
  lists: () => [...runsKeys.all, 'list'] as const,
  list: (params?: RunsListParams) => [...runsKeys.lists(), params] as const,
  details: () => [...runsKeys.all, 'detail'] as const,
  detail: (id: string) => [...runsKeys.details(), id] as const,
  steps: (id: string) => [...runsKeys.detail(id), 'steps'] as const,
};

/**
 * Hook to fetch list of runs
 */
export function useRuns(params?: RunsListParams) {
  return useQuery({
    queryKey: runsKeys.list(params),
    queryFn: () => runsAPI.list(params),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single run
 */
export function useRun(id: string) {
  return useQuery({
    queryKey: runsKeys.detail(id),
    queryFn: () => runsAPI.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch run steps
 */
export function useRunSteps(runId: string) {
  return useQuery({
    queryKey: runsKeys.steps(runId),
    queryFn: () => runsAPI.getSteps(runId),
    enabled: !!runId,
  });
}

/**
 * Hook to create a new run
 */
export function useCreateRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRunRequest) => runsAPI.create(data),
    onSuccess: (newRun: Run) => {
      // Invalidate runs list to refetch
      queryClient.invalidateQueries({ queryKey: runsKeys.lists() });
      
      toast({
        title: 'Run created',
        description: `Run ${newRun.id} has been started successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating run',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to cancel a run
 */
export function useCancelRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => runsAPI.cancel(id),
    onSuccess: (updatedRun: Run) => {
      // Update the specific run in cache
      queryClient.setQueryData(runsKeys.detail(updatedRun.id), updatedRun);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: runsKeys.lists() });
      
      toast({
        title: 'Run cancelled',
        description: `Run ${updatedRun.id} has been cancelled.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error cancelling run',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to retry a run
 */
export function useRetryRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => runsAPI.retry(id),
    onSuccess: (newRun: Run) => {
      queryClient.invalidateQueries({ queryKey: runsKeys.lists() });
      
      toast({
        title: 'Run retried',
        description: `Run ${newRun.id} has been restarted.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error retrying run',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
