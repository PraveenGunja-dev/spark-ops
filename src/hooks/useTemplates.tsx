/**
 * React Query hooks for Templates API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

// Types
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  downloads: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateListResponse {
  items: Template[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TemplateCreate {
  name: string;
  description: string;
  category: string;
  downloads?: number;
  rating?: number;
}

export interface TemplateUpdate {
  name?: string;
  description?: string;
  category?: string;
  downloads?: number;
  rating?: number;
}

// Query Keys
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (page: number, pageSize: number, category?: string, search?: string) =>
    [...templateKeys.lists(), { page, pageSize, category, search }] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  categories: () => [...templateKeys.all, 'categories'] as const,
};

/**
 * Hook to fetch paginated list of templates
 */
export function useTemplates(
  page: number = 1,
  pageSize: number = 20,
  category?: string,
  search?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: templateKeys.list(page, pageSize, category, search),
    queryFn: async () => {
      const params: Record<string, any> = { page, page_size: pageSize };
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await apiGet<TemplateListResponse>('/templates', params);
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch a single template by ID
 */
export function useTemplate(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: async () => {
      const response = await apiGet<Template>(`/templates/${id}`);
      return response.data;
    },
    enabled: options?.enabled !== false && !!id,
    staleTime: 60000,
  });
}

/**
 * Hook to fetch list of template categories
 */
export function useTemplateCategories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: templateKeys.categories(),
    queryFn: async () => {
      const response = await apiGet<string[]>('/templates/categories/list');
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TemplateCreate) => {
      const response = await apiPost<Template>('/templates', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all template lists
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.categories() });
    },
  });
}

/**
 * Hook to update an existing template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TemplateUpdate }) => {
      const response = await apiPut<Template>(`/templates/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate specific template and all lists
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook to delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiDelete(`/templates/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Invalidate specific template and all lists
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.categories() });
    },
  });
}

/**
 * Hook to increment download count
 */
export function useIncrementDownloads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiPost<Template>(`/templates/${id}/increment-downloads`, {});
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cached template data
      queryClient.setQueryData(templateKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}
