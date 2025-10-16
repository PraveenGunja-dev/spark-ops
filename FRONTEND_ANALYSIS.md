# Frontend Structure Analysis

## 📋 Overview
The frontend is a **React + TypeScript + Vite** application with **Shadcn/UI + Tailwind CSS** for styling. It follows a modern, component-based architecture with React Query for data fetching.

## 🎨 UI/UX Patterns

### Design System:
- **Maestro-inspired KPI cards** with gradient backgrounds
- **High-contrast minimal text** approach
- **Real-time dashboard** with activity feeds
- **Table-based data views** with pagination and filtering
- **Status badges** with color coding
- **Recharts** for data visualization
- **Loading skeletons** for async states

### Color Scheme:
- **Primary**: Blue tones for main actions
- **Success**: Green for healthy/completed states  
- **Warning**: Yellow/Orange for degraded/pending
- **Destructive**: Red for errors/failed states
- **Accent**: Purple/Lavender for secondary highlights

## 📊 Data Model (from types.ts)

### Core Entities:

1. **Project**
   - `id, name, slug, ownerUserId, createdAt`
   - Top-level organization unit

2. **Agent**
   - `id, name, runtime, model, tools[], projectId, env`
   - `concurrency, autoscale, health, lastHeartbeat`
   - `promptSummary`
   - Runtime: python | node
   - Health: healthy | degraded | unhealthy

3. **Tool**
   - `id, name, kind, provider, authType, scopes[]`
   - `projectId, env, createdAt, lastErrorAt`
   - `rateLimitPerMin`
   - Kind: http | db | saas | browser | search | storage | custom
   - AuthType: oauth | apikey | none

4. **Workflow**
   - `id, name, projectId, tags[]`
   - `versions[], avgDurationMs, successRate, lastRunAt`
   - Version tracking with status (draft | released)

5. **Run** (Workflow Execution)
   - `id, workflowId, workflowVersion, agentId, projectId`
   - `env, trigger, status, startedAt, endedAt`
   - `durationMs, tokensPrompt, tokensCompletion, usdCost`
   - `retries, hasHumanInLoop, region`
   - Status: queued | running | succeeded | failed | cancelled | timeout
   - Trigger: manual | schedule | webhook | event

6. **RunStep**
   - `id, runId, idx, type, name`
   - `startedAt, endedAt, durationMs, success`
   - `request, response, errorMessage`
   - Type: tool | prompt | decision | loop | webhook | human

7. **Schedule**
   - `id, name, type, expression, targetWorkflowId`
   - `nextRunAt, lastRunAt, status, ownerUserId`
   - Type: cron | webhook | event

8. **Queue**
   - `id, name, projectId, depth, oldestAgeSec`
   - `ratePerSec, leases, dlqSize`

9. **Dataset**
   - `id, name, type, sizeBytes, ownerUserId`
   - `retentionDays, createdAt, linkedRunIds[]`

10. **Incident**
    - `id, severity, title, status, runIds[]`
    - `ownerUserId, createdAt, slaMinutes`
    - Severity: sev1 | sev2 | sev3
    - Status: open | mitigated | resolved

11. **User**
    - `id, name, email, role`
    - Role: owner | admin | developer | viewer

## 📱 Pages & Features

### Dashboard (Command Center)
- **5 KPI Cards**: Agents Active, Runs Executing, Avg Latency, Tokens/Cost, Success Rate
- **Charts**: Runs per Hour (line), Avg Cost per Run (bar)
- **Live Activity Feed**: Real-time events with icons
- **System Health Panel**: Worker nodes, queue, database, policy violations

### Agents Page
- **Agent Registry Table**
- **Columns**: Name, Version, Runtime, Last Run, Success Rate, Avg Latency, Owner, Actions
- **Actions**: View Metrics, Configure Policy
- **Create New Agent** button

### Runs Page
- **Filters**: Search by ID, Status dropdown, Agent dropdown
- **Table Columns**: Run ID, Agent, Status, Started, Duration, Tokens (in/out), Cost, Actions
- **Actions**: View, Replay, Terminate (only for running)
- **Loading skeleton** support

### Tools Page
- Tool management interface

### Workflows Page
- Workflow listing and management

### RunDetails Page
- Detailed run execution view with steps

### Settings Page
- User preferences and system configuration

### Profile Page
- User profile management

### Teams Page
- Team collaboration features

### Policies Page
- Policy configuration and enforcement

### Approvals Page
- Human-in-the-loop approvals

### Evaluations Page
- Model/agent evaluations

### Analytics Page
- Advanced analytics and metrics

### Schedules, Queues, Incidents, Monitoring Pages
- Infrastructure management

## 🔌 API Integration Patterns

### Current Mock Data Usage:
```typescript
import { mockRuns, mockAgents, mockTools } from '@/lib/mockData';
```

### Expected Real API Patterns:
```typescript
// Using React Query hooks
const { data: runs, isLoading } = useRuns(filters);
const { data: agents } = useAgents(projectId);
const { mutate: createAgent } = useCreateAgent();
```

## 🎯 Backend API Requirements

### Must Support:

1. **Pagination**: `page`, `page_size` parameters
2. **Filtering**: By status, agent, project, environment
3. **Search**: Full-text search by ID, name
4. **Sorting**: By date, duration, cost
5. **Relationships**: Proper foreign keys (projectId, agentId, workflowId)
6. **Aggregations**: Success rates, avg durations, costs
7. **Real-time Updates**: WebSocket support (future)

### API Endpoint Structure Needed:

```
/api/v1/projects/
  GET    /                    - List projects
  POST   /                    - Create project
  GET    /{id}                - Get project
  PUT    /{id}                - Update project
  DELETE /{id}                - Delete project

/api/v1/agents/
  GET    /                    - List agents (filter by projectId)
  POST   /                    - Create agent
  GET    /{id}                - Get agent
  PUT    /{id}                - Update agent
  DELETE /{id}                - Delete agent
  GET    /{id}/metrics        - Agent metrics
  GET    /{id}/runs           - Agent run history

/api/v1/tools/
  GET    /                    - List tools
  POST   /                    - Create tool
  GET    /{id}                - Get tool
  PUT    /{id}                - Update tool
  DELETE /{id}                - Delete tool

/api/v1/workflows/
  GET    /                    - List workflows
  POST   /                    - Create workflow
  GET    /{id}                - Get workflow
  PUT    /{id}                - Update workflow
  DELETE /{id}                - Delete workflow
  GET    /{id}/versions       - Get versions
  POST   /{id}/versions       - Create new version
  POST   /{id}/execute        - Trigger workflow

/api/v1/runs/
  GET    /                    - List runs (paginated, filtered)
  POST   /                    - Create/trigger run
  GET    /{id}                - Get run details
  PUT    /{id}                - Update run
  DELETE /{id}/cancel         - Cancel running run
  POST   /{id}/replay         - Replay failed run
  GET    /{id}/steps          - Get run steps
  GET    /{id}/logs           - Get run logs

/api/v1/schedules/
  GET    /                    - List schedules
  POST   /                    - Create schedule
  GET    /{id}                - Get schedule
  PUT    /{id}                - Update schedule
  DELETE /{id}                - Delete schedule
  PUT    /{id}/pause          - Pause schedule
  PUT    /{id}/resume         - Resume schedule

/api/v1/queues/
  GET    /                    - List queues
  GET    /{id}                - Get queue stats
  GET    /{id}/items          - Get queue items

/api/v1/datasets/
  GET    /                    - List datasets
  POST   /                    - Create dataset
  GET    /{id}                - Get dataset
  DELETE /{id}                - Delete dataset

/api/v1/incidents/
  GET    /                    - List incidents
  POST   /                    - Create incident
  GET    /{id}                - Get incident
  PUT    /{id}                - Update incident status

/api/v1/analytics/
  GET    /dashboard           - Dashboard KPIs
  GET    /runs-per-hour       - Time series data
  GET    /cost-trend          - Cost analytics
  GET    /top-agents          - Agent performance
```

## 🚀 Implementation Priority

### Phase 1: Core CRUD (Current)
- ✅ Projects API
- ⏳ Agents API
- ⏳ Tools API
- ⏳ Workflows API

### Phase 2: Execution Engine
- Runs API (create, list, get, cancel)
- RunSteps tracking
- Status updates

### Phase 3: Scheduling & Automation
- Schedules API
- Queue management
- Incident tracking

### Phase 4: Analytics & Monitoring
- Dashboard KPIs endpoint
- Time-series metrics
- Cost analytics
- Real-time activity feed

### Phase 5: Advanced Features
- WebSocket for real-time updates
- File uploads for datasets
- Evaluation framework
- Policy engine

## 📦 Response Format Standards

### List Response:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

### Entity Response:
```json
{
  "id": "uuid",
  "name": "...",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  ...
}
```

### Error Response:
```json
{
  "detail": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

## 🎨 Frontend Preferences (from Memory)

1. **Clean interfaces** - No unnecessary elements
2. **Excel-style views** - All columns visible with auto-fit
3. **Traditional trees** - Simple hierarchy, no complex diagrams
4. **Consistent navigation** - Same tabs across dashboards
5. **Minimal refresh** - No manual refresh buttons
6. **Transparent effects** - Clean shader effects
7. **Full-screen hero sections** - Complete viewport usage
8. **Muted backgrounds** - Visual hierarchy with bg-muted/30

## 🔄 Next Steps

1. **Match backend models to frontend types** exactly
2. **Implement remaining CRUD APIs** (Agents, Tools, Workflows)
3. **Add Runs execution engine** with step tracking
4. **Build analytics endpoints** for dashboard
5. **Frontend integration** - Replace mockData with real API calls
6. **Real-time updates** - WebSocket or SSE
7. **Testing** - E2E tests with real data flow

---

**Key Insight**: The frontend is production-ready with comprehensive UI/UX. The backend must match this exact data model and provide the same filtering, pagination, and relationship patterns to enable a seamless integration.
