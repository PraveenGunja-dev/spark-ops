/**
 * Policies React Query Hooks
 * Integration with Policies API endpoints
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { Policy } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

export interface PolicyCreateData {
  name: string;
  projectId: string;
  description?: string;
  type: 'safety' | 'budget' | 'approval' | 'compliance';
  status?: 'active' | 'inactive' | 'draft';
  config?: Record<string, any>;
  rules?: Record<string, any>[];
  metadata?: Record<string, any>;
}

export interface PolicyUpdateData {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
  config?: Record<string, any>;
  rules?: Record<string, any>[];
  metadata?: Record<string, any>;
}

// ============================================================================
// API Functions
// ============================================================================

const getPolicies = async (projectId: string, params?: Record<string, any>) => {
  const searchParams = new URLSearchParams({
    project_id: projectId,
    ...params
  });
  return apiGet<Policy[]>(`/api/v1/policies?${searchParams.toString()}`);
};

const getPolicy = async (policyId: string) => {
  return apiGet<Policy>(`/api/v1/policies/${policyId}`);
};

const createPolicy = async (data: PolicyCreateData) => {
  return apiPost<Policy>('/api/v1/policies', data);
};

const updatePolicy = async (policyId: string, data: PolicyUpdateData) => {
  return apiPut<Policy>(`/api/v1/policies/${policyId}`, data);
};

const deletePolicy = async (policyId: string) => {
  return apiDelete(`/api/v1/policies/${policyId}`);
};

// ============================================================================
// Hooks
// ============================================================================

export const usePolicies = (projectId: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['policies', projectId, params],
    queryFn: () => getPolicies(projectId, params),
    enabled: !!projectId,
  });
};

export const usePolicy = (policyId: string) => {
  return useQuery({
    queryKey: ['policy', policyId],
    queryFn: () => getPolicy(policyId),
    enabled: !!policyId,
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, data }: { policyId: string; data: PolicyUpdateData }) => 
      updatePolicy(policyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policy'] });
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};