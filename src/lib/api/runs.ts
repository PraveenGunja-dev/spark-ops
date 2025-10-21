/**
 * Runs API
 * All API calls related to workflow runs
 */

import { apiGet, apiPost, apiDelete, apiPatch } from '../api-client';
import { Run, RunStep } from '../types';

export interface RunsListParams {
  page?: number;
  limit?: number;
  status?: string;
  agentId?: string;
  workflowId?: string;
  env?: string;
}

export interface RunsListResponse {
  runs: Run[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateRunRequest {
  workflowId: string;
  agentId: string;
  env: 'dev' | 'staging' | 'prod';
  trigger?: 'manual' | 'schedule' | 'webhook' | 'event';
}

export const runsAPI = {
  /**
   * Get list of runs with optional filters
   */
  list: async (params?: RunsListParams): Promise<RunsListResponse> => {
    return apiGet<RunsListResponse>('/runs', params as Record<string, string>);
  },

  /**
   * Get a single run by ID
   */
  getById: async (id: string): Promise<Run> => {
    return apiGet<Run>(`/runs/${id}`);
  },

  /**
   * Get steps for a specific run
   */
  getSteps: async (runId: string): Promise<RunStep[]> => {
    return apiGet<RunStep[]>(`/runs/${runId}/steps`);
  },

  /**
   * Create a new run
   */
  create: async (data: CreateRunRequest): Promise<Run> => {
    return apiPost<Run>('/runs', data);
  },

  /**
   * Cancel a running run
   */
  cancel: async (id: string): Promise<Run> => {
    return apiPatch<Run>(`/runs/${id}/cancel`);
  },

  /**
   * Retry a failed run
   */
  retry: async (id: string): Promise<Run> => {
    return apiPost<Run>(`/runs/${id}/retry`);
  },

  /**
   * Delete a run
   */
  delete: async (id: string): Promise<void> => {
    return apiDelete<void>(`/runs/${id}`);
  },
};
