/**
 * Runs React Query Hooks
 * Real API integration replacing mockData
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '@/lib/api-client';
import type { Run, RunStep } from '@/lib/types';

interface RunsListResponse {
  runs: Run[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateRunRequest {
  workflow_id: string;
  agent_id: string;
  env: 'dev' | 'staging' | 'prod';
  trigger?: string;
  input_data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

/**
 * Fetch runs with filters
 */
export function useRuns(page = 1, limit = 20, filters?: {
  status?: string;
  agentId?: string;
  workflowId?: string;
}) {
  return useQuery({
    queryKey: ['runs', page, limit, filters],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };
      
      if (filters?.status) params.status = filters.status;
      if (filters?.agentId) params.agentId = filters.agentId;
      if (filters?.workflowId) params.workflowId = filters.workflowId;

      const response = await apiGet<RunsListResponse>('/runs', params);
      return response;
    },
  });
}

/**
 * Fetch single run
 */
export function useRun(runId: string) {
  return useQuery({
    queryKey: ['run', runId],
    queryFn: async () => {
      const response = await apiGet<Run>(`/runs/${runId}`);
      return response;
    },
    enabled: !!runId,
  });
}

/**
 * Fetch run steps
 */
export function useRunSteps(runId: string) {
  return useQuery({
    queryKey: ['run-steps', runId],
    queryFn: async () => {
      const response = await apiGet<RunStep[]>(`/runs/${runId}/steps`);
      return response;
    },
    enabled: !!runId,
  });
}

/**
 * Create new run (trigger workflow)
 */
export function useCreateRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRunRequest) => {
      const response = await apiPost<Run>('/runs', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
    },
  });
}

/**
 * Cancel running run
 */
export function useCancelRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: string) => {
      const response = await apiPatch<Run>(`/runs/${runId}/cancel`);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['run', data.id] });
    },
  });
}

/**
 * Retry failed run
 */
export function useRetryRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: string) => {
      const response = await apiPost<Run>(`/runs/${runId}/retry`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
    },
  });
}
