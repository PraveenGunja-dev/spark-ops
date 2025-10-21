# 🏗️ Spark-Ops System Architecture

## Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + TypeScript)                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  UI Layer                                                             │  │
│  │  • Dashboard          • Run Timeline      • Agent Graph               │  │
│  │  • Workflow Editor    • Policy Management • Telemetry Dashboard       │  │
│  │  • React Query        • Error Boundaries  • Loading States           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTROL PLANE (FastAPI)                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  API Gateway (Port 8000)                                            │   │
│  │  • CORS Middleware    • Rate Limiting    • Authentication           │   │
│  │  • Request Validation • Error Handling   • Logging                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      ↓                                       │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐     │
│  │   Projects   │    Agents    │  Workflows   │   Runs & Tools       │     │
│  │   Service    │   Service    │   Service    │   Service            │     │
│  └──────────────┴──────────────┴──────────────┴──────────────────────┘     │
│                                      ↓                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Orchestration Engine                                               │   │
│  │  • Workflow DAG Parser  • State Machine   • Event Bus              │   │
│  │  • Task Scheduler       • Retry Logic     • Error Handling         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      ↓                                       │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐     │
│  │  Scheduler   │    Policy    │   Budget     │   Webhook            │     │
│  │  Service     │   Engine     │   Manager    │   Handler            │     │
│  └──────────────┴──────────────┴──────────────┴──────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MESSAGE QUEUE (Redis/Celery)                         │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐     │
│  │  Run Queue   │  Policy      │  Schedule    │   Webhook            │     │
│  │              │  Queue       │  Queue       │   Queue              │     │
│  └──────────────┴──────────────┴──────────────┴──────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WORKER LAYER (Celery Workers)                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐     │
│  │ Orchestrator │   Scheduler  │    Policy    │   Metrics            │     │
│  │ Workers (5)  │   Worker (1) │   Workers(3) │   Collector          │     │
│  └──────────────┴──────────────┴──────────────┴──────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA PLANE (Agent Runtime)                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Agent Runtime Environment                                          │   │
│  │  • Python Executor    • Node.js Executor   • LLM Interface         │   │
│  │  • Tool Manager       • Context Manager    • Memory Store          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      ↓                                       │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐     │
│  │   HTTP       │   Database   │   Browser    │   Search             │     │
│  │   Tools      │   Tools      │   Tools      │   Tools              │     │
│  └──────────────┴──────────────┴──────────────┴──────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STORAGE & PERSISTENCE                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                                 │  │
│  │  • Projects   • Agents      • Workflows    • Runs                   │  │
│  │  • Tools      • Schedules   • Policies     • Budgets                │  │
│  │  • Users      • Run Steps   • Violations   • Metrics                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Redis Cache & Queue                                                 │  │
│  │  • Session Store   • Rate Limiting   • Task Queue   • Pub/Sub       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Object Storage (S3/GCS)                                            │  │
│  │  • Run Artifacts   • Logs   • Datasets   • Models                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY & MONITORING                              │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐     │
│  │  LangWatch   │  Prometheus  │   Grafana    │   OpenTelemetry      │     │
│  │  (LLM Trace) │  (Metrics)   │  (Dashboard) │   (Tracing)          │     │
│  └──────────────┴──────────────┴──────────────┴──────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. User Creates a Run

```
User (Frontend)
    ↓ POST /api/v1/runs
API Gateway
    ↓ Authentication & Validation
Run Service
    ↓ Create Run Record
PostgreSQL
    ↓ Publish Task
Redis Queue
    ↓ Pick up task
Orchestrator Worker
    ↓ Execute Workflow
Agent Runtime
    ↓ Execute Tools
External APIs/Services
    ↓ Store Results
PostgreSQL + LangWatch
    ↓ Send Updates
WebSocket → Frontend
```

### 2. Policy Enforcement Flow

```
Run Creation Request
    ↓
Policy Service
    ↓ Check Budget
Budget Manager
    ↓ Check Constraints
Policy Engine
    ↓ Evaluate Rules
Decision: ALLOW | DENY | REQUIRE_APPROVAL
    ↓ if ALLOW
Continue Execution
    ↓ if REQUIRE_APPROVAL
Queue for Human Review
    ↓ if DENY
Return Error to User
```

### 3. Scheduled Run Execution

```
Scheduler Worker (Celery Beat)
    ↓ Check Cron Schedules
Schedule Service
    ↓ Find Due Schedules
PostgreSQL
    ↓ Create Runs
Run Service
    ↓ Queue for Execution
Redis Queue
    ↓
[Same as Run Creation Flow]
```

---

## Component Interaction Map

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │ HTTP/WS
         ↓
┌─────────────────┐     ┌──────────────┐
│  API Gateway    │────→│  Auth        │
└────────┬────────┘     └──────────────┘
         │
    ┌────┴─────┬─────────┬──────────┬───────────┐
    ↓          ↓         ↓          ↓           ↓
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Project │ │ Agent  │ │Workflow│ │  Run   │ │ Tool   │
│Service │ │Service │ │Service │ │Service │ │Service │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │           │           │          │
    └──────────┴───────────┴───────────┴──────────┘
                          ↓
                   ┌──────────────┐
                   │  PostgreSQL  │
                   └──────────────┘
```

---

## Database Schema Relationships

```
┌──────────┐        ┌──────────┐        ┌──────────┐
│  Users   │───────→│ Projects │←───────│  Agents  │
└──────────┘  1:N   └────┬─────┘   N:1  └────┬─────┘
                         │                     │
                         │ 1:N             1:N │
                         ↓                     ↓
                    ┌────────────┐      ┌──────────┐
                    │ Workflows  │      │  Tools   │
                    └─────┬──────┘      └──────────┘
                          │ 1:N
                          ↓
                    ┌──────────┐
                    │   Runs   │
                    └─────┬────┘
                          │ 1:N
                          ↓
                    ┌──────────┐
                    │RunSteps  │
                    └──────────┘

┌──────────┐        ┌──────────┐
│ Policies │───────→│Violations│
└──────────┘  1:N   └──────────┘

┌──────────┐        ┌──────────┐
│ Budgets  │───────→│ Projects │
└──────────┘  N:1   └──────────┘

┌──────────┐        ┌──────────┐
│Schedules │───────→│Workflows │
└──────────┘  N:1   └──────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│              Security Layers                     │
└─────────────────────────────────────────────────┘

Layer 1: Network Security
    • CORS Policy
    • Rate Limiting
    • DDoS Protection

Layer 2: Authentication
    • JWT Tokens (15min expiry)
    • Refresh Tokens (7 day expiry)
    • API Keys for programmatic access

Layer 3: Authorization
    • Role-Based Access Control (RBAC)
    • Project-level permissions
    • Resource ownership validation

Layer 4: Data Security
    • Password hashing (bcrypt)
    • Encrypted sensitive data
    • Secure secret management

Layer 5: Audit & Monitoring
    • Request logging
    • Audit trails
    • Security events tracking
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────┐
│           Production Deployment                   │
└──────────────────────────────────────────────────┘

┌─────────────┐
│Load Balancer│
└──────┬──────┘
       │
   ┌───┴────┬────────┬────────┐
   │        │        │        │
   ↓        ↓        ↓        ↓
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ API  │ │ API  │ │ API  │ │ API  │
│ Pod1 │ │ Pod2 │ │ Pod3 │ │ Pod4 │
└──────┘ └──────┘ └──────┘ └──────┘
   │        │        │        │
   └────────┴────────┴────────┘
            │
    ┌───────┴────────┐
    │                │
    ↓                ↓
┌─────────┐   ┌──────────┐
│PostgreSQL│   │  Redis   │
│ (RDS)    │   │(ElastiCache)
└─────────┘   └──────────┘

┌────────────────────────────────┐
│   Worker Nodes (Auto-scaling)  │
│  • Orchestrator Workers (5)    │
│  • Scheduler Worker (1)        │
│  • Policy Workers (3)          │
└────────────────────────────────┘

┌────────────────────────────────┐
│     Monitoring Stack           │
│  • Prometheus                  │
│  • Grafana                     │
│  • LangWatch                   │
└────────────────────────────────┘
```

---

## Technology Stack Summary

### Frontend
- **Framework:** React 18.3 + TypeScript 5.6
- **Build:** Vite 5.4 with SWC
- **UI:** shadcn/ui + Tailwind CSS
- **State:** TanStack React Query v5
- **Routing:** React Router DOM 6.30

### Backend
- **Framework:** FastAPI 0.109
- **Server:** Uvicorn (ASGI)
- **Language:** Python 3.11+
- **Validation:** Pydantic 2.5

### Database
- **Primary:** PostgreSQL 15+
- **ORM:** SQLAlchemy 2.0 (async)
- **Migrations:** Alembic 1.13

### Cache & Queue
- **Cache:** Redis 7+
- **Queue:** Celery 5.3

### Observability
- **Tracing:** LangWatch + OpenTelemetry
- **Metrics:** Prometheus
- **Logging:** Structlog
- **Visualization:** Grafana

---

**This architecture supports:**
- ✅ High scalability (horizontal scaling)
- ✅ High availability (multi-instance deployment)
- ✅ Real-time updates (WebSocket support)
- ✅ Async processing (Celery workers)
- ✅ Policy enforcement (built-in governance)
- ✅ Cost tracking (budget management)
- ✅ Comprehensive monitoring (full observability)
