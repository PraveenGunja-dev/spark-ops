/**
 * Tools API
 * All API calls related to tools and connectors
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../api-client';
import { Tool } from '../types';

export interface ToolsListParams {
  page?: number;
  limit?: number;
  kind?: string;
  env?: string;
}

export interface CreateToolRequest {
  name: string;
  kind: 'http' | 'db' | 'saas' | 'browser' | 'search' | 'storage' | 'custom';
  authType: 'oauth' | 'apikey' | 'none';
  provider?: string;
  scopes?: string[];
  projectId: string;
  env: 'dev' | 'staging' | 'prod';
  rateLimitPerMin?: number;
}

export interface UpdateToolRequest extends Partial<CreateToolRequest> {
  id: string;
}

export const toolsAPI = {
  /**
   * Get list of tools
   */
  list: async (params?: ToolsListParams): Promise<Tool[]> => {
    return apiGet<Tool[]>('/tools', params as Record<string, string>);
  },

  /**
   * Get a single tool by ID
   */
  getById: async (id: string): Promise<Tool> => {
    return apiGet<Tool>(`/tools/${id}`);
  },

  /**
   * Create a new tool
   */
  create: async (data: CreateToolRequest): Promise<Tool> => {
    return apiPost<Tool>('/tools', data);
  },

  /**
   * Update an existing tool
   */
  update: async (data: UpdateToolRequest): Promise<Tool> => {
    const { id, ...updateData } = data;
    return apiPut<Tool>(`/tools/${id}`, updateData);
  },

  /**
   * Delete a tool
   */
  delete: async (id: string): Promise<void> => {
    return apiDelete<void>(`/tools/${id}`);
  },

  /**
   * Test tool connection
   */
  testConnection: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiPost(`/tools/${id}/test`);
  },
};
