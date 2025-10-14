export type ID = string;
export type ISODate = string;

export interface Project {
  id: ID;
  name: string;
  slug: string;
  ownerUserId: ID;
  createdAt: ISODate;
}

export type Environment = 'dev' | 'staging' | 'prod';

export interface Agent {
  id: ID;
  name: string;
  runtime: 'python' | 'node';
  model: string;
  tools: ID[];
  projectId: ID;
  env: Environment;
  concurrency: number;
  autoscale: {
    min: number;
    max: number;
    targetCpu: number;
  };
  health: 'healthy' | 'degraded' | 'unhealthy';
  lastHeartbeat: ISODate;
  promptSummary: string;
}

export interface Tool {
  id: ID;
  name: string;
  kind: 'http' | 'db' | 'saas' | 'browser' | 'search' | 'storage' | 'custom';
  provider?: string;
  authType: 'oauth' | 'apikey' | 'none';
  scopes?: string[];
  projectId: ID;
  env: Environment;
  createdAt: ISODate;
  lastErrorAt?: ISODate;
  rateLimitPerMin?: number;
}

export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'timeout';

export interface Run {
  id: ID;
  workflowId: ID;
  workflowVersion: number;
  agentId: ID;
  projectId: ID;
  env: Environment;
  trigger: 'manual' | 'schedule' | 'webhook' | 'event';
  status: RunStatus;
  startedAt: ISODate;
  endedAt?: ISODate;
  durationMs?: number;
  tokensPrompt?: number;
  tokensCompletion?: number;
  usdCost?: number;
  retries: number;
  hasHumanInLoop: boolean;
  region: string;
}

export interface RunStep {
  id: ID;
  runId: ID;
  idx: number;
  type: 'tool' | 'prompt' | 'decision' | 'loop' | 'webhook' | 'human';
  name: string;
  startedAt: ISODate;
  endedAt: ISODate;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
  request?: any;
  response?: any;
}

export interface Workflow {
  id: ID;
  name: string;
  projectId: ID;
  tags: string[];
  versions: Array<{
    version: number;
    status: 'draft' | 'released';
    updatedAt: ISODate;
    authorUserId: ID;
    note?: string;
  }>;
  avgDurationMs?: number;
  successRate?: number;
  lastRunAt?: ISODate;
}

export interface Schedule {
  id: ID;
  name: string;
  type: 'cron' | 'webhook' | 'event';
  expression?: string;
  targetWorkflowId: ID;
  nextRunAt: ISODate;
  lastRunAt?: ISODate;
  status: 'active' | 'paused';
  ownerUserId: ID;
}

export interface Queue {
  id: ID;
  name: string;
  projectId: ID;
  depth: number;
  oldestAgeSec: number;
  ratePerSec: number;
  leases: number;
  dlqSize: number;
}

export interface Dataset {
  id: ID;
  name: string;
  type: 'file' | 'conversation' | 'metrics' | 'evaluation';
  sizeBytes: number;
  ownerUserId: ID;
  retentionDays: number;
  createdAt: ISODate;
  linkedRunIds: ID[];
}

export interface Incident {
  id: ID;
  severity: 'sev1' | 'sev2' | 'sev3';
  title: string;
  status: 'open' | 'mitigated' | 'resolved';
  runIds: ID[];
  ownerUserId: ID;
  createdAt: ISODate;
  slaMinutes: number;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
}
