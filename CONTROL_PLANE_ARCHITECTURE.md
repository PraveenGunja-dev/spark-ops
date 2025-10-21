# 🎛️ Control Plane Architecture

**Project:** Spark-Ops Agentic AI Orchestration Platform  
**Component:** Control Plane  
**Status:** Implementation Ready  
**Date:** 2025-10-15

---

## 📋 Overview

The Control Plane is the central management layer that orchestrates all AI agents, workflows, policies, and infrastructure resources. It provides APIs, scheduling, monitoring, and governance capabilities.

---

## 🏗️ Architecture Components

### 1. **API Gateway Layer**
- RESTful API endpoints for all operations
- Authentication & Authorization (JWT-based)
- Rate limiting & throttling
- Request validation & sanitization
- API versioning (v1, v2)

### 2. **Orchestration Engine**
- Workflow orchestration & execution
- Agent lifecycle management
- Task scheduling & queuing
- State management
- Retry logic & error handling

### 3. **Agent Registry**
- Agent registration & discovery
- Agent metadata storage
- Health checking & monitoring
- Version management
- Agent capability indexing

### 4. **Policy Engine**
- Budget enforcement
- Security policies
- Compliance rules
- Approval workflows
- Rate limiting policies

### 5. **Monitoring & Observability**
- LangWatch integration
- Metrics collection (Prometheus format)
- Trace aggregation
- Log aggregation
- Alert management

---

## 🔧 Technology Stack

### Backend Framework
```
Node.js 20+ with TypeScript
Framework: Express.js / Fastify
ORM: Prisma / TypeORM
API Docs: OpenAPI/Swagger
```

### Alternative: Python Stack
```
Python 3.11+
Framework: FastAPI
ORM: SQLAlchemy
Task Queue: Celery
```

### Databases
```
Primary: PostgreSQL 15+ (relational data)
Cache: Redis 7+ (sessions, queues)
Time-series: TimescaleDB (metrics)
```

### Message Queue
```
Redis Streams / RabbitMQ / Apache Kafka
For async task processing
```

### Observability
```
LangWatch (LLM tracing)
Prometheus (metrics)
Grafana (dashboards)
OpenTelemetry (distributed tracing)
```

---

## 📊 Database Schema

### Core Tables

#### `projects`
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  owner_user_id UUID NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

#### `agents`
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  runtime VARCHAR(50) NOT NULL, -- 'python', 'node'
  model VARCHAR(255) NOT NULL,
  tools UUID[] DEFAULT '{}',
  env VARCHAR(50) NOT NULL, -- 'dev', 'staging', 'prod'
  concurrency INTEGER DEFAULT 4,
  autoscale_config JSONB,
  health_status VARCHAR(50) DEFAULT 'healthy',
  last_heartbeat TIMESTAMP,
  prompt_summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `workflows`
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  definition JSONB NOT NULL, -- workflow DAG
  current_version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `workflow_versions`
```sql
CREATE TABLE workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  version INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'draft', 'released', 'deprecated'
  definition JSONB NOT NULL,
  author_user_id UUID NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workflow_id, version)
);
```

#### `runs`
```sql
CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  workflow_version INTEGER NOT NULL,
  agent_id UUID REFERENCES agents(id),
  project_id UUID REFERENCES projects(id),
  env VARCHAR(50) NOT NULL,
  trigger VARCHAR(50) NOT NULL, -- 'manual', 'schedule', 'webhook', 'event'
  status VARCHAR(50) NOT NULL, -- 'queued', 'running', 'succeeded', 'failed', 'cancelled'
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_ms INTEGER,
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  usd_cost DECIMAL(10, 4),
  retries INTEGER DEFAULT 0,
  has_human_in_loop BOOLEAN DEFAULT FALSE,
  region VARCHAR(50) DEFAULT 'us-east-1',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `run_steps`
```sql
CREATE TABLE run_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES runs(id),
  idx INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'tool', 'prompt', 'decision', 'loop', 'webhook', 'human'
  name VARCHAR(255) NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  duration_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  request JSONB,
  response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `tools`
```sql
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  kind VARCHAR(50) NOT NULL, -- 'http', 'db', 'saas', 'browser', 'search', 'storage', 'custom'
  provider VARCHAR(255),
  auth_type VARCHAR(50) NOT NULL, -- 'oauth', 'apikey', 'none'
  scopes TEXT[] DEFAULT '{}',
  env VARCHAR(50) NOT NULL,
  rate_limit_per_min INTEGER,
  config JSONB DEFAULT '{}',
  last_error_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `schedules`
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'cron', 'webhook', 'event'
  expression TEXT, -- cron expression
  target_workflow_id UUID REFERENCES workflows(id),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused'
  next_run_at TIMESTAMP,
  last_run_at TIMESTAMP,
  owner_user_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `policies`
```sql
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'budget', 'approval', 'security', 'compliance'
  condition TEXT NOT NULL, -- expression: "cost > 100"
  action VARCHAR(50) NOT NULL, -- 'block', 'approve', 'notify', 'log'
  enabled BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `policy_violations`
```sql
CREATE TABLE policy_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES policies(id),
  run_id UUID REFERENCES runs(id),
  severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'acknowledged', 'resolved'
  description TEXT NOT NULL,
  resolution TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `budgets`
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  team_id UUID,
  allocated DECIMAL(10, 2) NOT NULL,
  spent DECIMAL(10, 2) DEFAULT 0,
  period VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  alert_threshold INTEGER DEFAULT 80, -- percentage
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'owner', 'admin', 'developer', 'viewer'
  api_key VARCHAR(255) UNIQUE,
  settings JSONB DEFAULT '{}',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/register          - Register new user
POST   /api/v1/auth/login             - Login
POST   /api/v1/auth/refresh           - Refresh token
POST   /api/v1/auth/logout            - Logout
GET    /api/v1/auth/me                - Get current user
```

### Projects
```
GET    /api/v1/projects               - List projects
POST   /api/v1/projects               - Create project
GET    /api/v1/projects/:id           - Get project
PATCH  /api/v1/projects/:id           - Update project
DELETE /api/v1/projects/:id           - Delete project
```

### Agents
```
GET    /api/v1/agents                 - List agents
POST   /api/v1/agents                 - Create agent
GET    /api/v1/agents/:id             - Get agent
PATCH  /api/v1/agents/:id             - Update agent
DELETE /api/v1/agents/:id             - Delete agent
POST   /api/v1/agents/:id/heartbeat   - Agent heartbeat
GET    /api/v1/agents/:id/metrics     - Agent metrics
```

### Workflows
```
GET    /api/v1/workflows              - List workflows
POST   /api/v1/workflows              - Create workflow
GET    /api/v1/workflows/:id          - Get workflow
PATCH  /api/v1/workflows/:id          - Update workflow
DELETE /api/v1/workflows/:id          - Delete workflow
POST   /api/v1/workflows/:id/versions - Create version
GET    /api/v1/workflows/:id/versions - List versions
```

### Runs
```
GET    /api/v1/runs                   - List runs
POST   /api/v1/runs                   - Create run
GET    /api/v1/runs/:id               - Get run
PATCH  /api/v1/runs/:id/cancel        - Cancel run
POST   /api/v1/runs/:id/retry         - Retry run
GET    /api/v1/runs/:id/steps         - Get run steps
GET    /api/v1/runs/:id/logs          - Get run logs
```

### Tools
```
GET    /api/v1/tools                  - List tools
POST   /api/v1/tools                  - Create tool
GET    /api/v1/tools/:id              - Get tool
PATCH  /api/v1/tools/:id              - Update tool
DELETE /api/v1/tools/:id              - Delete tool
```

### Schedules
```
GET    /api/v1/schedules              - List schedules
POST   /api/v1/schedules              - Create schedule
GET    /api/v1/schedules/:id          - Get schedule
PATCH  /api/v1/schedules/:id          - Update schedule
DELETE /api/v1/schedules/:id          - Delete schedule
POST   /api/v1/schedules/:id/trigger  - Manual trigger
```

### Policies
```
GET    /api/v1/policies               - List policies
POST   /api/v1/policies               - Create policy
GET    /api/v1/policies/:id           - Get policy
PATCH  /api/v1/policies/:id           - Update policy
DELETE /api/v1/policies/:id           - Delete policy
GET    /api/v1/policies/violations    - List violations
```

### Budgets
```
GET    /api/v1/budgets                - List budgets
POST   /api/v1/budgets                - Create budget
GET    /api/v1/budgets/:id            - Get budget
PATCH  /api/v1/budgets/:id            - Update budget
DELETE /api/v1/budgets/:id            - Delete budget
```

### Metrics & Monitoring
```
GET    /api/v1/metrics/overview       - System overview
GET    /api/v1/metrics/runs           - Run metrics
GET    /api/v1/metrics/agents         - Agent metrics
GET    /api/v1/metrics/costs          - Cost metrics
GET    /api/v1/telemetry/traces       - LangWatch traces
GET    /api/v1/telemetry/evaluations  - Quality evaluations
```

---

## 🔄 Service Architecture

### 1. API Service (Port 3000)
```typescript
// Express.js with TypeScript
- Authentication middleware
- Request validation
- Rate limiting
- Error handling
- OpenAPI documentation
```

### 2. Orchestration Service (Port 3001)
```typescript
// Workflow execution engine
- Workflow DAG parsing
- Task scheduling
- State management
- Event emission
- Webhook handling
```

### 3. Scheduler Service (Port 3002)
```typescript
// Cron job management
- Schedule parsing
- Trigger evaluation
- Run creation
- Failure handling
```

### 4. Policy Service (Port 3003)
```typescript
// Policy evaluation engine
- Policy condition evaluation
- Budget tracking
- Violation recording
- Approval workflow
```

### 5. Worker Service (Multiple instances)
```typescript
// Task execution workers
- Queue consumption
- Agent runtime management
- Tool execution
- Result reporting
```

---

## 📡 Communication Patterns

### Synchronous (REST)
```
Frontend -> API Gateway -> Services
```

### Asynchronous (Message Queue)
```
API Service -> Redis Queue -> Worker Service
```

### Event-Driven
```
Service -> Event Bus -> Subscribers
```

### WebSocket (Real-time updates)
```
Frontend <-> WebSocket Server <- Event Stream
```

---

## 🔒 Security

### Authentication
- JWT tokens (15min access, 7d refresh)
- API keys for programmatic access
- OAuth2 for third-party integrations

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- Project-based isolation

### Encryption
- TLS 1.3 for transport
- AES-256 for sensitive data at rest
- Secrets in HashiCorp Vault / AWS Secrets Manager

---

## 📊 Monitoring & Observability

### Metrics (Prometheus)
```
- Request rate, latency, errors
- Agent health status
- Workflow success rate
- Queue depth
- Cost tracking
```

### Logs (Structured JSON)
```
- Request/response logs
- Application logs
- Error logs
- Audit logs
```

### Traces (OpenTelemetry)
```
- Distributed tracing
- LangWatch integration
- Request flow visualization
```

### Alerts
```
- Policy violations
- Budget exceeded
- Service down
- High error rate
```

---

## 🚀 Deployment

### Container Architecture
```
Docker containers orchestrated by Kubernetes
- API pods (3+ replicas)
- Worker pods (auto-scaling)
- Scheduler pod (single instance)
- Policy service pods
```

### Infrastructure as Code
```
Terraform / Pulumi
- AWS EKS / GCP GKE
- RDS PostgreSQL
- ElastiCache Redis
- S3 / GCS for storage
```

### CI/CD
```
GitHub Actions / GitLab CI
- Build Docker images
- Run tests
- Deploy to staging
- Deploy to production
```

---

## 📝 Next Steps

### Phase 1: Foundation (Week 1-2)
1. Set up project structure
2. Configure database with Prisma/TypeORM
3. Implement authentication service
4. Create base API endpoints
5. Set up testing framework

### Phase 2: Core Services (Week 3-4)
1. Implement orchestration engine
2. Build agent registry
3. Create scheduler service
4. Develop policy engine
5. Set up message queue

### Phase 3: Integration (Week 5-6)
1. Connect to LangWatch
2. Implement monitoring stack
3. Add webhook support
4. Create worker service
5. Build admin dashboard

### Phase 4: Production (Week 7-8)
1. Load testing
2. Security audit
3. Documentation
4. Deployment automation
5. Go live

---

## 📚 References

- **OpenAPI Spec**: `/docs/openapi.yaml`
- **Database Migrations**: `/migrations/`
- **Architecture Diagrams**: `/docs/diagrams/`
- **API Documentation**: `/docs/api/`

---

**Status:** Ready for Implementation  
**Last Updated:** 2025-10-15
