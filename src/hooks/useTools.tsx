/**
 * React Query hooks for Tools management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

// Types matching backend Tool schema
export interface Tool {
  id: string;
  name: string;
  kind: string;
  authType: string;
  rateLimitPerMin: number | null;
  projectId: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ToolsListResponse {
  items: Tool[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateToolRequest {
  name: string;
  kind: string;
  authType: string;
  rateLimitPerMin?: number;
  projectId: string;
  description?: string;
  config?: Record<string, any>;
  authConfig?: Record<string, any>;
}

export interface UpdateToolRequest {
  name?: string;
  kind?: string;
  authType?: string;
  rateLimitPerMin?: number;
  description?: string;
  config?: Record<string, any>;
  authConfig?: Record<string, any>;
}

/**
 * Fetch tools list with pagination and filters
 */
export function useTools(
  projectId: string,
  page = 1,
  pageSize = 20,
  filters?: {
    kind?: string;
    authType?: string;
  }
) {
  return useQuery({
    queryKey: ['tools', projectId, page, pageSize, filters],
    queryFn: async () => {
      const params: Record<string, string> = {
        project_id: projectId,
        page: page.toString(),
        page_size: pageSize.toString(),
      };
      
      if (filters?.kind) params.kind = filters.kind;
      if (filters?.authType) params.auth_type = filters.authType;

      const response = await apiGet<ToolsListResponse>('/tools', params);
      return response;
    },
    enabled: !!projectId,
  });
}

/**
 * Fetch single tool details
 */
export function useTool(toolId: string) {
  return useQuery({
    queryKey: ['tool', toolId],
    queryFn: async () => {
      const response = await apiGet<Tool>(`/tools/${toolId}`);
      return response;
    },
    enabled: !!toolId,
  });
}

/**
 * Create new tool
 */
export function useCreateTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateToolRequest) => {
      return apiPost<Tool>('/tools', data);
    },
    onSuccess: () => {
      // Invalidate and refetch tools list
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}

/**
 * Update existing tool
 */
export function useUpdateTool(toolId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateToolRequest) => {
      return apiPut<Tool>(`/tools/${toolId}`, data);
    },
    onSuccess: () => {
      // Invalidate specific tool and tools list
      queryClient.invalidateQueries({ queryKey: ['tool', toolId] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}

/**
 * Delete tool
 */
export function useDeleteTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (toolId: string) => {
      return apiDelete(`/tools/${toolId}`);
    },
    onSuccess: () => {
      // Invalidate tools list
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
}

/**
 * Test tool execution
 */
export function useTestTool() {
  return useMutation({
    mutationFn: async (toolId: string) => {
      return apiPost<{ success: boolean; message: string; output?: any }>(
        `/tools/${toolId}/test`,
        {}
      );
    },
  });
}
