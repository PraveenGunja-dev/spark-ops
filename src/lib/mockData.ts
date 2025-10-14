import { Project, Agent, Tool, Run, RunStep, Workflow, Schedule, Queue, Dataset, Incident, User, RunStatus } from './types';

export const mockUsers: User[] = [
  { id: 'u-1', name: 'Ada Admin', email: 'ada@example.com', role: 'owner' },
  { id: 'u-2', name: 'Dev D', email: 'dev@example.com', role: 'developer' },
  { id: 'u-3', name: 'Sarah Smith', email: 'sarah@example.com', role: 'admin' },
  { id: 'u-4', name: 'Mike Chen', email: 'mike@example.com', role: 'developer' },
];

export const mockProjects: Project[] = [
  { id: 'p-ada', name: 'ADA', slug: 'ada', ownerUserId: 'u-1', createdAt: '2025-09-01T08:21:00Z' },
  { id: 'p-orch', name: 'Orchestrator', slug: 'orch', ownerUserId: 'u-2', createdAt: '2025-08-12T11:05:00Z' },
  { id: 'p-pulse', name: 'Pulse AI', slug: 'pulse', ownerUserId: 'u-1', createdAt: '2025-07-20T14:30:00Z' },
];

export const mockAgents: Agent[] = [
  {
    id: 'a-research',
    name: 'ResearchAgent',
    runtime: 'python',
    model: 'gpt-4o',
    tools: ['t-web', 't-scrape', 't-postgres'],
    projectId: 'p-ada',
    env: 'prod',
    concurrency: 8,
    autoscale: { min: 2, max: 20, targetCpu: 65 },
    health: 'healthy',
    lastHeartbeat: '2025-10-14T05:05:13Z',
    promptSummary: 'Search, read, extract, and summarize research papers.',
  },
  {
    id: 'a-marketer',
    name: 'MarketingAgent',
    runtime: 'node',
    model: 'llama-3.1-70b',
    tools: ['t-slack', 't-gmail', 't-hubspot'],
    projectId: 'p-ada',
    env: 'staging',
    concurrency: 4,
    autoscale: { min: 1, max: 10, targetCpu: 60 },
    health: 'degraded',
    lastHeartbeat: '2025-10-14T05:04:47Z',
    promptSummary: 'Omnichannel copy generation + A/B testing + CRM updates.',
  },
  {
    id: 'a-support',
    name: 'SupportAgent',
    runtime: 'python',
    model: 'gpt-4o-mini',
    tools: ['t-zendesk', 't-slack'],
    projectId: 'p-orch',
    env: 'prod',
    concurrency: 12,
    autoscale: { min: 3, max: 30, targetCpu: 70 },
    health: 'healthy',
    lastHeartbeat: '2025-10-14T05:06:01Z',
    promptSummary: 'Customer support ticket triage and response generation.',
  },
];

export const mockTools: Tool[] = [
  {
    id: 't-web',
    name: 'HTTP',
    kind: 'http',
    authType: 'none',
    projectId: 'p-ada',
    env: 'prod',
    createdAt: '2025-07-03T09:10:00Z',
    rateLimitPerMin: 1200,
  },
  {
    id: 't-scrape',
    name: 'Browser (Puppeteer)',
    kind: 'browser',
    authType: 'none',
    projectId: 'p-ada',
    env: 'prod',
    createdAt: '2025-07-03T09:10:00Z',
  },
  {
    id: 't-postgres',
    name: 'Postgres',
    kind: 'db',
    authType: 'apikey',
    projectId: 'p-ada',
    env: 'prod',
    createdAt: '2025-07-03T09:10:00Z',
    lastErrorAt: '2025-10-13T18:33:00Z',
  },
  {
    id: 't-slack',
    name: 'Slack',
    kind: 'saas',
    provider: 'Slack',
    authType: 'oauth',
    scopes: ['chat:write', 'channels:read'],
    projectId: 'p-ada',
    env: 'staging',
    createdAt: '2025-06-11T12:00:00Z',
  },
  {
    id: 't-gmail',
    name: 'Gmail',
    kind: 'saas',
    provider: 'Google',
    authType: 'oauth',
    scopes: ['gmail.send', 'gmail.readonly'],
    projectId: 'p-ada',
    env: 'staging',
    createdAt: '2025-06-15T10:20:00Z',
  },
  {
    id: 't-hubspot',
    name: 'HubSpot CRM',
    kind: 'saas',
    provider: 'HubSpot',
    authType: 'apikey',
    projectId: 'p-ada',
    env: 'staging',
    createdAt: '2025-07-01T08:45:00Z',
    rateLimitPerMin: 100,
  },
  {
    id: 't-zendesk',
    name: 'Zendesk',
    kind: 'saas',
    provider: 'Zendesk',
    authType: 'apikey',
    projectId: 'p-orch',
    env: 'prod',
    createdAt: '2025-06-20T11:00:00Z',
  },
];

export const mockWorkflows: Workflow[] = [
  {
    id: 'w-web-research',
    name: 'Web Research Pipeline',
    projectId: 'p-ada',
    tags: ['research', 'scrape'],
    versions: [
      { version: 1, status: 'released', updatedAt: '2025-09-01T12:01:00Z', authorUserId: 'u-1', note: 'Initial' },
      { version: 2, status: 'released', updatedAt: '2025-10-01T10:30:00Z', authorUserId: 'u-1', note: 'Add browser retries' },
    ],
    avgDurationMs: 82000,
    successRate: 0.93,
    lastRunAt: '2025-10-14T05:55:11Z',
  },
  {
    id: 'w-email-campaign',
    name: 'Email Campaign Generator',
    projectId: 'p-ada',
    tags: ['marketing', 'email'],
    versions: [
      { version: 1, status: 'released', updatedAt: '2025-08-15T09:20:00Z', authorUserId: 'u-2' },
    ],
    avgDurationMs: 45000,
    successRate: 0.97,
    lastRunAt: '2025-10-14T04:12:33Z',
  },
  {
    id: 'w-support-ticket',
    name: 'Support Ticket Processor',
    projectId: 'p-orch',
    tags: ['support', 'automation'],
    versions: [
      { version: 1, status: 'released', updatedAt: '2025-07-10T14:00:00Z', authorUserId: 'u-2' },
      { version: 2, status: 'released', updatedAt: '2025-09-05T16:30:00Z', authorUserId: 'u-2', note: 'Add sentiment detection' },
    ],
    avgDurationMs: 12000,
    successRate: 0.98,
    lastRunAt: '2025-10-14T05:58:22Z',
  },
];

// Generate more realistic runs
const generateRuns = (): Run[] => {
  const runs: Run[] = [];
  const statuses: RunStatus[] = ['succeeded', 'succeeded', 'succeeded', 'succeeded', 'failed', 'running', 'queued'];
  const triggers = ['schedule', 'manual', 'webhook', 'event'];
  
  for (let i = 0; i < 100; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const startDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const duration = status === 'running' || status === 'queued' ? undefined : 10000 + Math.random() * 200000;
    
    runs.push({
      id: `r-${10000 + i}`,
      workflowId: mockWorkflows[Math.floor(Math.random() * mockWorkflows.length)].id,
      workflowVersion: Math.floor(Math.random() * 2) + 1,
      agentId: mockAgents[Math.floor(Math.random() * mockAgents.length)].id,
      projectId: mockProjects[Math.floor(Math.random() * mockProjects.length)].id,
      env: ['dev', 'staging', 'prod'][Math.floor(Math.random() * 3)] as any,
      trigger: triggers[Math.floor(Math.random() * triggers.length)] as any,
      status,
      startedAt: startDate.toISOString(),
      endedAt: duration ? new Date(startDate.getTime() + duration).toISOString() : undefined,
      durationMs: duration,
      tokensPrompt: status === 'succeeded' ? 5000 + Math.floor(Math.random() * 50000) : undefined,
      tokensCompletion: status === 'succeeded' ? 1000 + Math.floor(Math.random() * 10000) : undefined,
      usdCost: status === 'succeeded' ? 0.5 + Math.random() * 5 : undefined,
      retries: Math.floor(Math.random() * 3),
      hasHumanInLoop: Math.random() > 0.9,
      region: ['us-east-1', 'eu-west-1', 'ap-south-1'][Math.floor(Math.random() * 3)],
    });
  }
  
  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
};

export const mockRuns: Run[] = generateRuns();

export const mockRunSteps: RunStep[] = [
  {
    id: 'rs-1',
    runId: 'r-10000',
    idx: 1,
    type: 'tool',
    name: 'http.fetch',
    startedAt: '2025-10-14T05:00:05Z',
    endedAt: '2025-10-14T05:00:23Z',
    durationMs: 18000,
    success: true,
    request: { url: 'https://example.com' },
    response: { status: 200 },
  },
  {
    id: 'rs-2',
    runId: 'r-10000',
    idx: 2,
    type: 'prompt',
    name: 'summarize',
    startedAt: '2025-10-14T05:00:24Z',
    endedAt: '2025-10-14T05:01:10Z',
    durationMs: 46000,
    success: true,
  },
];

export const mockSchedules: Schedule[] = [
  {
    id: 'sch-1',
    name: 'Daily Research 6AM',
    type: 'cron',
    expression: '0 6 * * *',
    targetWorkflowId: 'w-web-research',
    nextRunAt: '2025-10-15T00:30:00Z',
    lastRunAt: '2025-10-14T00:30:00Z',
    status: 'active',
    ownerUserId: 'u-1',
  },
  {
    id: 'sch-2',
    name: 'Hourly Support Check',
    type: 'cron',
    expression: '0 * * * *',
    targetWorkflowId: 'w-support-ticket',
    nextRunAt: '2025-10-14T06:00:00Z',
    lastRunAt: '2025-10-14T05:00:00Z',
    status: 'active',
    ownerUserId: 'u-2',
  },
];

export const mockQueues: Queue[] = [
  {
    id: 'q-1',
    name: 'research-tasks',
    projectId: 'p-ada',
    depth: 1784,
    oldestAgeSec: 5421,
    ratePerSec: 22,
    leases: 8,
    dlqSize: 12,
  },
  {
    id: 'q-2',
    name: 'marketing-jobs',
    projectId: 'p-ada',
    depth: 432,
    oldestAgeSec: 1205,
    ratePerSec: 8,
    leases: 4,
    dlqSize: 3,
  },
];

export const mockDatasets: Dataset[] = [
  {
    id: 'd-1',
    name: 'SERP-Summaries-Oct',
    type: 'file',
    sizeBytes: 83423423,
    ownerUserId: 'u-1',
    retentionDays: 30,
    createdAt: '2025-10-10T09:11:00Z',
    linkedRunIds: ['r-10000'],
  },
];

export const mockIncidents: Incident[] = [
  {
    id: 'i-123',
    severity: 'sev2',
    title: 'Spike in tool errors (Postgres)',
    status: 'open',
    runIds: ['r-10000'],
    ownerUserId: 'u-2',
    createdAt: '2025-10-14T05:20:00Z',
    slaMinutes: 120,
  },
  {
    id: 'i-124',
    severity: 'sev3',
    title: 'Rate limit exceeded on Slack API',
    status: 'mitigated',
    runIds: ['r-10001', 'r-10002'],
    ownerUserId: 'u-2',
    createdAt: '2025-10-13T14:35:00Z',
    slaMinutes: 240,
  },
];
