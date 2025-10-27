/**
 * Analytics React Query Hooks
 * Integration with Analytics API endpoints
 */
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';

// ============================================================================
// Types
// ============================================================================

export interface LatencyDataPoint {
  time: string;
  latency: number;
  count: number;
}

export interface CostDataPoint {
  day?: string;
  hour?: string;
  cost: number;
  runs: number;
}

export interface ModelUsageData {
  model: string;
  usage: number;
  cost: number;
}

export interface ToolUtilizationData {
  tool: string;
  usage: number;
  success: number;
}

export interface ThroughputDataPoint {
  time: string;
  throughput: number;
  errors: number;
}

export interface AnalyticsSummary {
  total_runs: number;
  success_rate: number;
  total_cost: number;
  avg_latency: number;
  active_agents: number;
  total_tokens: number;
}

interface LatencyResponse {
  data: LatencyDataPoint[];
}

interface CostResponse {
  data: CostDataPoint[];
}

interface ModelUsageResponse {
  data: ModelUsageData[];
}

interface ToolUtilizationResponse {
  data: ToolUtilizationData[];
}

interface ThroughputResponse {
  data: ThroughputDataPoint[];
}

// ============================================================================
// Analytics Hooks
// ============================================================================

/**
 * Get latency analytics
 */
export function useLatencyAnalytics(
  timeRange: '1d' | '7d' | '30d' | '90d' = '7d',
  interval: 'hour' | 'day' = 'hour',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['analytics', 'latency', timeRange, interval],
    queryFn: async () => {
      const response = await apiGet<LatencyResponse>(
        `/analytics/latency`,
        {
          time_range: timeRange,
          interval: interval,
        }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get cost analytics
 */
export function useCostAnalytics(
  timeRange: '1d' | '7d' | '30d' | '90d' = '7d',
  interval: 'hour' | 'day' = 'day',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['analytics', 'cost', timeRange, interval],
    queryFn: async () => {
      const response = await apiGet<CostResponse>(
        `/analytics/cost`,
        {
          time_range: timeRange,
          interval: interval,
        }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 60000,
  });
}

/**
 * Get model usage analytics
 */
export function useModelUsageAnalytics(
  timeRange: '1d' | '7d' | '30d' | '90d' = '7d',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['analytics', 'models', timeRange],
    queryFn: async () => {
      const response = await apiGet<ModelUsageResponse>(
        `/analytics/models`,
        {
          time_range: timeRange,
        }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 60000,
  });
}

/**
 * Get tool utilization analytics
 */
export function useToolUtilizationAnalytics(
  timeRange: '1d' | '7d' | '30d' | '90d' = '7d',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['analytics', 'tools', timeRange],
    queryFn: async () => {
      const response = await apiGet<ToolUtilizationResponse>(
        `/analytics/tools`,
        {
          time_range: timeRange,
        }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 60000,
  });
}

/**
 * Get throughput analytics
 */
export function useThroughputAnalytics(
  timeRange: '24h' | '7d' | '30d' = '24h',
  interval: 'hour' | 'day' = 'hour',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['analytics', 'throughput', timeRange, interval],
    queryFn: async () => {
      const response = await apiGet<ThroughputResponse>(
        `/analytics/throughput`,
        {
          time_range: timeRange,
          interval: interval,
        }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 60000,
  });
}

/**
 * Get analytics summary
 */
export function useAnalyticsSummary(
  timeRange: '1d' | '7d' | '30d' | '90d' = '7d',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['analytics', 'summary', timeRange],
    queryFn: async () => {
      const response = await apiGet<AnalyticsSummary>(
        `/analytics/summary`,
        {
          time_range: timeRange,
        }
      );
      return response;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000, // 30 seconds for summary
  });
}
