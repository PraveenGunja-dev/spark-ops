/**
 * Unit tests for validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  createRunSchema,
  createAgentSchema,
  createWorkflowSchema,
  loginSchema,
  validateSchema,
} from './validation';

describe('createRunSchema', () => {
  it('should validate valid run data', () => {
    const validData = {
      workflowId: 'w-123',
      agentId: 'a-456',
      env: 'prod' as const,
    };

    const result = createRunSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing workflowId', () => {
    const invalidData = {
      agentId: 'a-456',
      env: 'prod' as const,
    };

    const result = createRunSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid env', () => {
    const invalidData = {
      workflowId: 'w-123',
      agentId: 'a-456',
      env: 'invalid',
    };

    const result = createRunSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('createAgentSchema', () => {
  it('should validate valid agent data', () => {
    const validData = {
      name: 'TestAgent',
      runtime: 'python' as const,
      model: 'gpt-4',
      tools: ['tool-1'],
      projectId: 'p-123',
      env: 'dev' as const,
      concurrency: 4,
    };

    const result = createAgentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid agent name', () => {
    const invalidData = {
      name: 'ab', // too short
      runtime: 'python' as const,
      model: 'gpt-4',
      tools: ['tool-1'],
      projectId: 'p-123',
      env: 'dev' as const,
    };

    const result = createAgentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject agent name with invalid characters', () => {
    const invalidData = {
      name: 'Test Agent!', // contains space and special char
      runtime: 'python' as const,
      model: 'gpt-4',
      tools: ['tool-1'],
      projectId: 'p-123',
      env: 'dev' as const,
    };

    const result = createAgentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should apply default concurrency', () => {
    const data = {
      name: 'TestAgent',
      runtime: 'python' as const,
      model: 'gpt-4',
      tools: ['tool-1'],
      projectId: 'p-123',
      env: 'dev' as const,
    };

    const result = createAgentSchema.parse(data);
    expect(result.concurrency).toBe(4);
  });
});

describe('loginSchema', () => {
  it('should validate valid login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'short',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should apply default rememberMe', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = loginSchema.parse(data);
    expect(result.rememberMe).toBe(false);
  });
});

describe('validateSchema helper', () => {
  it('should return success for valid data', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = validateSchema(loginSchema, data);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should return errors for invalid data', () => {
    const data = {
      email: 'invalid',
      password: 'short',
    };

    const result = validateSchema(loginSchema, data);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });
});
