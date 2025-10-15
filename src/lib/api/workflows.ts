/**
 * Workflows API
 * All API calls related to workflows
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../api-client';
import { Workflow } from '../types';

export interface WorkflowsListParams {
  page?: number;
  limit?: number;
  tags?: string[];
  projectId?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  projectId: string;
  tags?: string[];
}

export interface UpdateWorkflowRequest {
  id: string;
  name?: string;
  tags?: string[];
}

export const workflowsAPI = {
  /**
   * Get list of workflows
   */
  list: async (params?: WorkflowsListParams): Promise<Workflow[]> => {
    return apiGet<Workflow[]>('/workflows', params as Record<string, string>);
  },

  /**
   * Get a single workflow by ID
   */
  getById: async (id: string): Promise<Workflow> => {
    return apiGet<Workflow>(`/workflows/${id}`);
  },

  /**
   * Create a new workflow
   */
  create: async (data: CreateWorkflowRequest): Promise<Workflow> => {
    return apiPost<Workflow>('/workflows', data);
  },

  /**
   * Update an existing workflow
   */
  update: async (data: UpdateWorkflowRequest): Promise<Workflow> => {
    const { id, ...updateData } = data;
    return apiPut<Workflow>(`/workflows/${id}`, updateData);
  },

  /**
   * Delete a workflow
   */
  delete: async (id: string): Promise<void> => {
    return apiDelete<void>(`/workflows/${id}`);
  },

  /**
   * Get workflow analytics
   */
  getAnalytics: async (id: string): Promise<{
    avgDurationMs: number;
    successRate: number;
    totalRuns: number;
    lastRunAt?: string;
  }> => {
    return apiGet(`/workflows/${id}/analytics`);
  },
};
