/**
 * Projects React Query Hooks
 * Real API integration replacing mockData
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { Project } from '@/lib/types';

interface ProjectsListResponse {
  items: Project[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: 'active' | 'archived' | 'draft';
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'archived' | 'draft';
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Fetch all projects with pagination
 */
export function useProjects(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['projects', page, pageSize],
    queryFn: async () => {
      const response = await apiGet<ProjectsListResponse>('/projects', {
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      return response;
    },
  });
}

/**
 * Fetch single project by ID
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await apiGet<Project>(`/projects/${projectId}`);
      return response;
    },
    enabled: !!projectId,
  });
}

/**
 * Create new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectRequest) => {
      const response = await apiPost<Project>('/projects', data);
      return response;
    },
    onSuccess: () => {
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Update existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectRequest }) => {
      const response = await apiPut<Project>(`/projects/${id}`, data);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate both list and single project queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
    },
  });
}

/**
 * Delete project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      await apiDelete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
