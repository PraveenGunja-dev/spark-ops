/**
 * Workflows React Query Hooks
 * Real API integration replacing mockData
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { Workflow } from '@/lib/types';

interface WorkflowsListResponse {
  items: Workflow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface CreateWorkflowRequest {
  name: string;
  projectId: string;
  tags?: string[];
  description?: string;
  definition?: Record<string, unknown>;
  trigger_type?: string;
}

/**
 * Fetch workflows for a project
 */
export function useWorkflows(projectId: string, page = 1, pageSize = 20, filters?: {
  status?: string;
  tags?: string[];
}) {
  return useQuery({
    queryKey: ['workflows', projectId, page, pageSize, filters],
    queryFn: async () => {
      const params: Record<string, string> = {
        project_id: projectId,
        page: page.toString(),
        page_size: pageSize.toString(),
      };
      
      if (filters?.status) params.status = filters.status;
      if (filters?.tags?.length) params.tags = filters.tags.join(',');

      const response = await apiGet<WorkflowsListResponse>('/workflows', params);
      return response;
    },
    enabled: !!projectId,
  });
}

/**
 * Fetch single workflow
 */
export function useWorkflow(workflowId: string) {
  return useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: async () => {
      const response = await apiGet<Workflow>(`/workflows/${workflowId}`);
      return response;
    },
    enabled: !!workflowId,
  });
}

/**
 * Create new workflow
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkflowRequest) => {
      const response = await apiPost<Workflow>('/workflows', data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows', data.projectId] });
    },
  });
}

/**
 * Update workflow
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateWorkflowRequest> }) => {
      const response = await apiPut<Workflow>(`/workflows/${id}`, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', data.id] });
    },
  });
}

/**
 * Delete workflow
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      await apiDelete(`/workflows/${workflowId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

/**
 * Get workflow analytics
 */
export function useWorkflowAnalytics(workflowId: string) {
  return useQuery({
    queryKey: ['workflow-analytics', workflowId],
    queryFn: async () => {
      const response = await apiGet<{
        avgDurationMs: number;
        successRate: number;
        totalRuns: number;
        lastRunAt?: string;
        failedRuns: number;
        succeededRuns: number;
      }>(`/workflows/${workflowId}/analytics`);
      return response;
    },
    enabled: !!workflowId,
  });
}
