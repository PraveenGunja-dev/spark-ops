/**
 * Form validation schemas using Zod
 * Centralized validation logic for all forms
 */

import { z } from 'zod';

/**
 * Create Run Form Schema
 */
export const createRunSchema = z.object({
  workflowId: z.string().min(1, 'Workflow is required'),
  agentId: z.string().min(1, 'Agent is required'),
  env: z.enum(['dev', 'staging', 'prod'], {
    required_error: 'Environment is required',
  }),
  trigger: z.enum(['manual', 'schedule', 'webhook', 'event']).optional(),
});

export type CreateRunFormData = z.infer<typeof createRunSchema>;

/**
 * Create Agent Form Schema
 */
export const createAgentSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, hyphens, and underscores'),
  runtime: z.enum(['python', 'node'], {
    required_error: 'Runtime is required',
  }),
  model: z.string().min(1, 'Model is required'),
  tools: z.array(z.string()).min(1, 'At least one tool is required'),
  projectId: z.string().min(1, 'Project is required'),
  env: z.enum(['dev', 'staging', 'prod']),
  concurrency: z
    .number()
    .int()
    .min(1, 'Concurrency must be at least 1')
    .max(100, 'Concurrency must not exceed 100')
    .default(4),
  autoscale: z
    .object({
      min: z.number().int().min(1).default(1),
      max: z.number().int().min(1).max(100).default(10),
      targetCpu: z.number().int().min(1).max(100).default(70),
    })
    .optional(),
  promptSummary: z.string().max(500, 'Summary must not exceed 500 characters').optional(),
});

export type CreateAgentFormData = z.infer<typeof createAgentSchema>;

/**
 * Create Workflow Form Schema
 */
export const createWorkflowSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters'),
  projectId: z.string().min(1, 'Project is required'),
  tags: z.array(z.string()).default([]),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
});

export type CreateWorkflowFormData = z.infer<typeof createWorkflowSchema>;

/**
 * Create Tool Form Schema
 */
export const createToolSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must not exceed 50 characters'),
  kind: z.enum(['http', 'db', 'saas', 'browser', 'search', 'storage', 'custom'], {
    required_error: 'Tool kind is required',
  }),
  authType: z.enum(['oauth', 'apikey', 'none'], {
    required_error: 'Authentication type is required',
  }),
  provider: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  projectId: z.string().min(1, 'Project is required'),
  env: z.enum(['dev', 'staging', 'prod']),
  rateLimitPerMin: z.number().int().min(1).max(10000).optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
});

export type CreateToolFormData = z.infer<typeof createToolSchema>;

/**
 * User Settings Form Schema
 */
export const userSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  notifications: z.object({
    email: z.boolean().default(true),
    slack: z.boolean().default(false),
    sms: z.boolean().default(false),
  }),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  timezone: z.string().default('UTC'),
});

export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;

/**
 * Login Form Schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Filter Form Schema (for data tables)
 */
export const filterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  env: z.enum(['dev', 'staging', 'prod', 'all']).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type FilterFormData = z.infer<typeof filterSchema>;

/**
 * Team Member Invitation Schema
 */
export const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'developer', 'viewer'], {
    required_error: 'Role is required',
  }),
  message: z.string().max(500).optional(),
});

export type InviteTeamMemberFormData = z.infer<typeof inviteTeamMemberSchema>;

/**
 * Schedule Creation Schema
 */
export const createScheduleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['cron', 'webhook', 'event']),
  expression: z.string().optional(),
  targetWorkflowId: z.string().min(1, 'Workflow is required'),
  status: z.enum(['active', 'paused']).default('active'),
  webhookUrl: z.string().url().optional(),
  eventType: z.string().optional(),
}).refine(
  (data) => {
    // If type is cron, expression is required
    if (data.type === 'cron') {
      return !!data.expression && data.expression.length > 0;
    }
    // If type is webhook, webhookUrl is required
    if (data.type === 'webhook') {
      return !!data.webhookUrl;
    }
    // If type is event, eventType is required
    if (data.type === 'event') {
      return !!data.eventType;
    }
    return true;
  },
  {
    message: 'Required field based on schedule type is missing',
    path: ['expression'],
  }
);

export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;

/**
 * Helper function to validate data against a schema
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}
