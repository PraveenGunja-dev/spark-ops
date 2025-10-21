/**
 * Agents React Query Hooks
 * Real API integration replacing mockData
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { Agent } from '@/lib/types';

interface AgentsListResponse {
  items: Agent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface CreateAgentRequest {
  name: string;
  projectId: string;
  runtime: 'python' | 'node';
  model: string;
  provider: string;
  temperature?: number;
  env: 'dev' | 'staging' | 'prod';
  concurrency?: number;
  promptSummary?: string;
  tools?: string[];
  autoscale_min?: number;
  autoscale_max?: number;
  autoscale_target_cpu?: number;
}

/**
 * Fetch agents for a project
 */
export function useAgents(projectId: string, page = 1, pageSize = 20, filters?: {
  env?: string;
  health?: 'healthy' | 'degraded' | 'unhealthy';
  status?: string;
}) {
  return useQuery({
    queryKey: ['agents', projectId, page, pageSize, filters],
    queryFn: async () => {
      const params: Record<string, string> = {
        project_id: projectId,
        page: page.toString(),
        page_size: pageSize.toString(),
      };
      
      if (filters?.env) params.env = filters.env;
      if (filters?.health) params.health = filters.health;
      if (filters?.status) params.status = filters.status;

      const response = await apiGet<AgentsListResponse>('/agents', params);
      return response;
    },
    enabled: !!projectId,
  });
}

/**
 * Fetch single agent
 */
export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const response = await apiGet<Agent>(`/agents/${agentId}`);
      return response;
    },
    enabled: !!agentId,
  });
}

/**
 * Create new agent
 */
export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAgentRequest) => {
      const response = await apiPost<Agent>('/agents', data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agents', data.projectId] });
    },
  });
}

/**
 * Update agent
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAgentRequest> }) => {
      const response = await apiPut<Agent>(`/agents/${id}`, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent', data.id] });
    },
  });
}

/**
 * Delete agent
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId: string) => {
      await apiDelete(`/agents/${agentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

/**
 * Get agent health
 */
export function useAgentHealth(agentId: string) {
  return useQuery({
    queryKey: ['agent-health', agentId],
    queryFn: async () => {
      const response = await apiGet<{
        health: 'healthy' | 'degraded' | 'unhealthy';
        lastHeartbeat: string;
        metrics: Record<string, unknown>;
      }>(`/agents/${agentId}/health`);
      return response;
    },
    enabled: !!agentId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
