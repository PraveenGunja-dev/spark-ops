/**
 * APA (Agentic Process Automation) React Query Hooks
 * Integration with Execution Plane API
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api-client';

// ============================================================================
// Types
// ============================================================================

export interface ReasoningTrace {
  id: string;
  run_id: string;
  agent_id: string;
  step_index: number;
  thought: string;
  action: {
    type: string;
    description?: string;
    parameters?: Record<string, any>;
    result?: any;
  };
  observation: {
    status: string;
    result?: any;
    error?: string;
  };
  reflection?: string;
  tokens_used?: number;
  latency_ms?: number;
  created_at: string;
}

export interface AgentMemory {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: string;
  importance_score?: number;
  access_count?: number;
  last_accessed_at?: string;
  created_at: string;
}

export interface HITLRequest {
  id: string;
  run_id: string;
  agent_id: string;
  request_type: string;
  reason: string;
  action_details: Record<string, any>;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  responded_at?: string;
  feedback?: string;
}

interface ReasonRequest {
  description: string;
  parameters?: Record<string, any>;
  execution_id?: string;
  max_iterations?: number;
}

interface ReasonResponse {
  agent_id: string;
  execution_id: string;
  result: {
    status: string;
    result?: any;
    iterations: number;
    actions_taken: number;
    reason?: string;
    error?: string;
  };
}

interface ReasoningTraceResponse {
  agent_id: string;
  run_id?: string;
  count: number;
  traces: ReasoningTrace[];
}

interface AgentMemoryResponse {
  agent_id: string;
  memory_type?: string;
  count: number;
  memories: AgentMemory[];
}

interface HITLListResponse {
  count: number;
  requests: HITLRequest[];
}

// ============================================================================
// Agent Reasoning Hooks
// ============================================================================

/**
 * Execute agent reasoning for a task
 */
export function useAgentReason(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ReasonRequest) => {
      const response = await apiPost<ReasonResponse>(
        `/apa/agents/${agentId}/reason`,
        request
      );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate reasoning traces to fetch new data
      queryClient.invalidateQueries({ 
        queryKey: ['reasoning-traces', agentId] 
      });
    },
  });
}

/**
 * Fetch reasoning traces for an agent
 */
export function useReasoningTraces(
  agentId: string,
  runId?: string,
  options?: { limit?: number; enabled?: boolean }
) {
  return useQuery({
    queryKey: ['reasoning-traces', agentId, runId],
    queryFn: async () => {
      const params: Record<string, string> = {
        limit: (options?.limit || 50).toString(),
      };
      
      if (runId) {
        params.run_id = runId;
      }

      const response = await apiGet<ReasoningTraceResponse>(
        `/apa/agents/${agentId}/reasoning-trace`,
        params
      );
      return response;
    },
    enabled: options?.enabled !== false && !!agentId,
  });
}

// ============================================================================
// Agent Memory Hooks
// ============================================================================

/**
 * Fetch agent memories
 */
export function useAgentMemory(
  agentId: string,
  memoryType?: 'episodic' | 'semantic' | 'procedural',
  options?: { limit?: number; enabled?: boolean }
) {
  return useQuery({
    queryKey: ['agent-memory', agentId, memoryType],
    queryFn: async () => {
      const params: Record<string, string> = {
        limit: (options?.limit || 20).toString(),
      };
      
      if (memoryType) {
        params.memory_type = memoryType;
      }

      const response = await apiGet<AgentMemoryResponse>(
        `/apa/agents/${agentId}/memory`,
        params
      );
      return response;
    },
    enabled: options?.enabled !== false && !!agentId,
  });
}

/**
 * Search agent memories
 */
export function useSearchMemory(agentId: string) {
  return useMutation({
    mutationFn: async ({ query, limit = 10 }: { query: string; limit?: number }) => {
      const response = await apiPost<AgentMemoryResponse>(
        `/apa/memory/search`,
        {
          agent_id: agentId,
          query,
          limit,
        }
      );
      return response;
    },
  });
}

/**
 * Store agent memory
 */
export function useStoreMemory(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      content: string;
      memory_type: 'episodic' | 'semantic' | 'procedural';
      importance_score?: number;
      metadata?: Record<string, any>;
    }) => {
      const response = await apiPost(
        `/apa/memory`,
        {
          agent_id: agentId,
          ...data,
        }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['agent-memory', agentId] 
      });
    },
  });
}

// ============================================================================
// HITL (Human-in-the-Loop) Hooks
// ============================================================================

/**
 * Fetch pending HITL requests
 */
export function usePendingHITL(options?: { limit?: number; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['hitl-pending'],
    queryFn: async () => {
      const params: Record<string, string> = {
        limit: (options?.limit || 50).toString(),
      };

      const response = await apiGet<HITLListResponse>(
        `/apa/hitl/pending`,
        params
      );
      return response;
    },
    refetchInterval: options?.refetchInterval || 10000, // Refetch every 10 seconds
  });
}

/**
 * Fetch HITL request by ID
 */
export function useHITLRequest(requestId: string, enabled = true) {
  return useQuery({
    queryKey: ['hitl-request', requestId],
    queryFn: async () => {
      const response = await apiGet<HITLRequest>(
        `/apa/hitl/${requestId}`
      );
      return response;
    },
    enabled: enabled && !!requestId,
  });
}

/**
 * Approve HITL request
 */
export function useApproveHITL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      feedback 
    }: { 
      requestId: string; 
      feedback?: string 
    }) => {
      const response = await apiPost(
        `/apa/hitl/${requestId}/approve`,
        { feedback }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hitl-pending'] });
      queryClient.invalidateQueries({ queryKey: ['hitl-request'] });
    },
  });
}

/**
 * Reject HITL request
 */
export function useRejectHITL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      feedback 
    }: { 
      requestId: string; 
      feedback?: string 
    }) => {
      const response = await apiPost(
        `/apa/hitl/${requestId}/reject`,
        { feedback }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hitl-pending'] });
      queryClient.invalidateQueries({ queryKey: ['hitl-request'] });
    },
  });
}

// ============================================================================
// Learning & Feedback Hooks
// ============================================================================

/**
 * Submit learning feedback for an agent
 */
export function useAgentLearn(agentId: string) {
  return useMutation({
    mutationFn: async (data: {
      task_description: string;
      action_taken: Record<string, any>;
      outcome: string;
      success: boolean;
      error_message?: string;
      improvement_suggestions?: string;
    }) => {
      const response = await apiPost(
        `/apa/agents/${agentId}/learn`,
        data
      );
      return response;
    },
  });
}

// ============================================================================
// Tool Execution Hooks
// ============================================================================

/**
 * List available tools
 */
export function useAvailableTools() {
  return useQuery({
    queryKey: ['apa-tools'],
    queryFn: async () => {
      const response = await apiGet<{ tools: string[] }>(
        `/apa/tools`
      );
      return response;
    },
  });
}

/**
 * Execute a tool
 */
export function useExecuteTool() {
  return useMutation({
    mutationFn: async ({
      toolName,
      parameters,
    }: {
      toolName: string;
      parameters: Record<string, any>;
    }) => {
      const response = await apiPost(
        `/apa/tools/${toolName}/execute`,
        { parameters }
      );
      return response;
    },
  });
}

