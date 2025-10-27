/**
 * Schedules React Query Hooks
 * Integration with Schedules API endpoints
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { Schedule } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

export interface ScheduleCreateData {
  name: string;
  projectId: string;
  workflowId: string;
  description?: string;
  cronExpression: string;
  timezone?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ScheduleUpdateData {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'paused';
  cronExpression?: string;
  timezone?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
}

// ============================================================================
// API Functions
// ============================================================================

const getSchedules = async (projectId: string, params?: Record<string, any>) => {
  const searchParams = new URLSearchParams({
    project_id: projectId,
    ...params
  });
  return apiGet<Schedule[]>(`/api/v1/schedules?${searchParams.toString()}`);
};

const getSchedule = async (scheduleId: string) => {
  return apiGet<Schedule>(`/api/v1/schedules/${scheduleId}`);
};

const createSchedule = async (data: ScheduleCreateData) => {
  return apiPost<Schedule>('/api/v1/schedules', data);
};

const updateSchedule = async (scheduleId: string, data: ScheduleUpdateData) => {
  return apiPut<Schedule>(`/api/v1/schedules/${scheduleId}`, data);
};

const deleteSchedule = async (scheduleId: string) => {
  return apiDelete(`/api/v1/schedules/${scheduleId}`);
};

// ============================================================================
// Hooks
// ============================================================================

export const useSchedules = (projectId: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['schedules', projectId, params],
    queryFn: () => getSchedules(projectId, params),
    enabled: !!projectId,
  });
};

export const useSchedule = (scheduleId: string) => {
  return useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => getSchedule(scheduleId),
    enabled: !!scheduleId,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: string; data: ScheduleUpdateData }) => 
      updateSchedule(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};