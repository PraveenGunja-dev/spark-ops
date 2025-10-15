/**
 * Agents API
 * All API calls related to AI agents
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../api-client';
import { Agent } from '../types';

export interface AgentsListParams {
  page?: number;
  limit?: number;
  env?: string;
  health?: 'healthy' | 'degraded' | 'unhealthy';
}

export interface CreateAgentRequest {
  name: string;
  runtime: 'python' | 'node';
  model: string;
  tools: string[];
  projectId: string;
  env: 'dev' | 'staging' | 'prod';
  concurrency?: number;
  promptSummary?: string;
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  id: string;
}

export const agentsAPI = {
  /**
   * Get list of agents
   */
  list: async (params?: AgentsListParams): Promise<Agent[]> => {
    return apiGet<Agent[]>('/agents', params as Record<string, string>);
  },

  /**
   * Get a single agent by ID
   */
  getById: async (id: string): Promise<Agent> => {
    return apiGet<Agent>(`/agents/${id}`);
  },

  /**
   * Create a new agent
   */
  create: async (data: CreateAgentRequest): Promise<Agent> => {
    return apiPost<Agent>('/agents', data);
  },

  /**
   * Update an existing agent
   */
  update: async (data: UpdateAgentRequest): Promise<Agent> => {
    const { id, ...updateData } = data;
    return apiPut<Agent>(`/agents/${id}`, updateData);
  },

  /**
   * Delete an agent
   */
  delete: async (id: string): Promise<void> => {
    return apiDelete<void>(`/agents/${id}`);
  },

  /**
   * Get agent health metrics
   */
  getHealth: async (id: string): Promise<{
    health: 'healthy' | 'degraded' | 'unhealthy';
    lastHeartbeat: string;
    metrics: Record<string, unknown>;
  }> => {
    return apiGet(`/agents/${id}/health`);
  },
};
