# Spark-Ops Layer Diagram

## Visual Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    👤 USER                                    ┃
┃                 (Human Operator)                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                           ↕
                    Browser Interface
                           ↕
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                   MAESTRO PLATFORM                            ┃
┃                   (Interface Layer)                           ┃
┃                                                               ┃
┃  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  ┃
┃  │  Dashboard  │  │   Agents    │  │   Observability     │  ┃
┃  │  /maestro   │  │   /agents   │  │   /observability    │  ┃
┃  └─────────────┘  └─────────────┘  └─────────────────────┘  ┃
┃                                                               ┃
┃  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  ┃
┃  │    HITL     │  │ Governance  │  │   Integrations      │  ┃
┃  │   /hitl     │  │ /governance │  │   /integrations     │  ┃
┃  └─────────────┘  └─────────────┘  └─────────────────────┘  ┃
┃                                                               ┃
┃  Components:                                                  ┃
┃  • ReasoningTraceViewer • AgentMemoryViewer                  ┃
┃  • HITLApprovalCard • MaestroSidebar                         ┃
┃                                                               ┃
┃  Tech: React + TypeScript + Vite + shadcn-ui                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                           ↕
                    REST API Calls
                  (HTTP/JSON over port 8000)
                           ↕
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    APA ENGINE                                 ┃
┃                  (Execution Layer)                            ┃
┃                                                               ┃
┃  ┌──────────────────────────────────────────────────────┐   ┃
┃  │         Agent Executor (Main Orchestrator)           │   ┃
┃  │  • Manages agent run lifecycle                       │   ┃
┃  │  • Coordinates all other services                    │   ┃
┃  └──────────────────────────────────────────────────────┘   ┃
┃                          ↕                                    ┃
┃  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  ┃
┃  │  Reasoning  │  │   Context   │  │    Tool Registry    │  ┃
┃  │   Engine    │  │   Manager   │  │  • web_search       │  ┃
┃  │  • OpenAI   │  │  • Memory   │  │  • http_request     │  ┃
┃  │  • Anthropic│  │  • Vectors  │  │  • run_sql          │  ┃
┃  └─────────────┘  └─────────────┘  └─────────────────────┘  ┃
┃                                                               ┃
┃  ┌─────────────┐  ┌─────────────┐                            ┃
┃  │   Safety    │  │   Vector    │                            ┃
┃  │   Engine    │  │   Store     │                            ┃
┃  │  • Policies │  │  • ChromaDB │                            ┃
┃  │  • HITL     │  │  • Pinecone │                            ┃
┃  └─────────────┘  └─────────────┘                            ┃
┃                                                               ┃
┃  Tech: FastAPI + Python + LangChain + OpenAI + ChromaDB      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                           ↕
                  Database Connections
                           ↕
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                  INFRASTRUCTURE                               ┃
┃                                                               ┃
┃  ┌─────────────────┐  ┌───────────────┐  ┌────────────────┐ ┃
┃  │   PostgreSQL    │  │   Vector DB   │  │   LLM APIs     │ ┃
┃  │   + pgvector    │  │  ChromaDB/    │  │   OpenAI/      │ ┃
┃  │                 │  │   Pinecone    │  │   Anthropic    │ ┃
┃  │  • agents       │  │               │  │                │ ┃
┃  │  • runs         │  │  • embeddings │  │  • GPT-4       │ ┃
┃  │  • traces       │  │  • memories   │  │  • Claude      │ ┃
┃  │  • memory       │  │               │  │                │ ┃
┃  │  • hitl         │  │               │  │                │ ┃
┃  └─────────────────┘  └───────────────┘  └────────────────┘ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## Data Flow: Creating and Running an Agent

```
USER ACTION: "Create new agent"
    ↓
MAESTRO: 
    └→ Component: AgentForm
    └→ User fills in: name, purpose, LLM model, tools
    └→ Click "Create Agent"
    ↓
API CALL:
    POST /api/agents
    Body: {
      name: "Support Ticket Analyzer",
      llm_provider: "openai",
      llm_model: "gpt-4",
      tools: ["run_sql", "send_email"]
    }
    ↓
APA ENGINE:
    └→ Receives request at FastAPI endpoint
    └→ Validates with Pydantic schema
    └→ Stores in PostgreSQL (agents table)
    └→ Initializes reasoning engine config
    └→ Returns: {id: "uuid-123", status: "ready"}
    ↓
MAESTRO:
    └→ Receives response
    └→ Redirects to /maestro/agents/uuid-123
    └→ Shows "Agent created successfully"

═══════════════════════════════════════════════════════════

USER ACTION: "Run agent with input"
    ↓
MAESTRO:
    └→ Component: RunAgentDialog
    └→ User enters: "Analyze today's support tickets"
    └→ Click "Run"
    ↓
API CALL:
    POST /api/apa/runs
    Body: {
      agent_id: "uuid-123",
      inputs: {goal: "Analyze today's support tickets"}
    }
    ↓
APA ENGINE - Agent Executor:
    └→ Creates run record in database
    └→ Starts execution loop:
    
    ITERATION 1:
    ┌─────────────────────────────────────┐
    │ Reasoning Engine                    │
    │  → Calls OpenAI GPT-4               │
    │  → Returns:                         │
    │    Thought: "Need to fetch tickets" │
    │    Action: run_sql                  │
    │    Params: {query: "SELECT..."}     │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Safety Engine                       │
    │  → Checks risk level                │
    │  → run_sql = MEDIUM risk            │
    │  → Allows execution                 │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Tool Registry                       │
    │  → Executes SQL query               │
    │  → Returns: 47 tickets found        │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Context Manager                     │
    │  → Stores memory of this action     │
    │  → Generates embedding              │
    │  → Saves to vector DB               │
    └─────────────────────────────────────┘
    
    ITERATION 2:
    ┌─────────────────────────────────────┐
    │ Reasoning Engine                    │
    │  → Thought: "Analyze sentiment"     │
    │  → Action: execute_python           │
    │  → Params: {code: "analyze..."}     │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Safety Engine                       │
    │  → execute_python = MEDIUM          │
    │  → Allows execution                 │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Tool Registry                       │
    │  → Runs Python code                 │
    │  → Returns: sentiment scores        │
    └─────────────────────────────────────┘
    
    ITERATION 3:
    ┌─────────────────────────────────────┐
    │ Reasoning Engine                    │
    │  → Thought: "Send summary email"    │
    │  → Action: send_email               │
    │  → Params: {to: "...", body: "..."} │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Safety Engine                       │
    │  → send_email = HIGH RISK!          │
    │  → Creates HITL request             │
    │  → PAUSES execution                 │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Database                            │
    │  → Inserts into hitl_requests       │
    │  → status = "pending"               │
    └─────────────────────────────────────┘
    ↓
MAESTRO:
    └→ Receives real-time notification
    └→ Shows alert: "Approval needed"
    └→ User clicks notification
    └→ Navigates to /maestro/hitl
    ↓
USER ACTION: Reviews email, clicks "Approve"
    ↓
API CALL:
    POST /api/apa/hitl/hitl-uuid-456/approve
    ↓
APA ENGINE:
    └→ Updates hitl_requests status = "approved"
    └→ RESUMES agent execution
    
    ITERATION 3 (continued):
    ┌─────────────────────────────────────┐
    │ Tool Registry                       │
    │  → Executes send_email              │
    │  → Email sent successfully          │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Reasoning Engine                    │
    │  → Thought: "Goal achieved"         │
    │  → Action: FINISH                   │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ Agent Executor                      │
    │  → Marks run as COMPLETED           │
    │  → Stores final outputs             │
    │  → Returns results                  │
    └─────────────────────────────────────┘
    ↓
MAESTRO:
    └→ Component: AgentDetails page
    └→ Updates run status to "Completed"
    └→ Shows reasoning traces (3 iterations)
    └→ Shows metrics: tokens used, latency
    └→ User can view full decision history
```

## Communication Protocols

### Maestro → APA (HTTP REST)
```
Protocol: HTTP/1.1 or HTTP/2
Format: JSON
Authentication: JWT Bearer Token
Port: 8000 (development), 443 (production)

Example:
  Request:
    POST /api/apa/runs HTTP/1.1
    Host: localhost:8000
    Authorization: Bearer eyJhbGc...
    Content-Type: application/json
    
    {
      "agent_id": "uuid-123",
      "inputs": {"goal": "Analyze tickets"}
    }
  
  Response:
    HTTP/1.1 201 Created
    Content-Type: application/json
    
    {
      "run_id": "uuid-789",
      "status": "running",
      "created_at": "2025-10-21T10:30:00Z"
    }
```

### APA Internal (Python async)
```python
# Services communicate via direct async function calls
# No HTTP overhead, just Python coroutines

# Example:
async def execute_run(self, run_id: UUID):
    # Call reasoning engine
    decision = await self.reasoning_engine.reason(
        agent_config=agent,
        context=current_context
    )
    
    # Call safety engine
    safety = await self.safety_engine.check_safety(
        action=decision["action"],
        agent_id=agent.id
    )
    
    # Call tool registry
    result = await self.tool_registry.execute_tool(
        tool_name=decision["action"]["tool"],
        params=decision["action"]["params"]
    )
```

### APA → Infrastructure (DB/API)
```
PostgreSQL:
  Protocol: PostgreSQL wire protocol
  Library: asyncpg (async driver)
  Connection: asyncio connection pool

Vector DB (ChromaDB):
  Protocol: HTTP REST
  Format: JSON
  Local: http://localhost:8000 (separate port)

Vector DB (Pinecone):
  Protocol: gRPC
  Format: Protocol Buffers
  Cloud: api.pinecone.io

OpenAI API:
  Protocol: HTTPS
  Format: JSON
  Endpoint: https://api.openai.com/v1/chat/completions

Anthropic API:
  Protocol: HTTPS
  Format: JSON
  Endpoint: https://api.anthropic.com/v1/messages
```

## Component Responsibility Matrix

| Responsibility | Maestro | APA | Infrastructure |
|----------------|---------|-----|----------------|
| Render UI | ✅ | ❌ | ❌ |
| User authentication | ✅ | ❌ | ❌ |
| Form validation (client) | ✅ | ❌ | ❌ |
| API request | ✅ | ❌ | ❌ |
| Form validation (server) | ❌ | ✅ | ❌ |
| Business logic | ❌ | ✅ | ❌ |
| LLM reasoning | ❌ | ✅ | ❌ |
| Tool execution | ❌ | ✅ | ❌ |
| Safety checks | ❌ | ✅ | ❌ |
| Memory management | ❌ | ✅ | ❌ |
| Data persistence | ❌ | ❌ | ✅ |
| Vector search | ❌ | ❌ | ✅ |
| LLM inference | ❌ | ❌ | ✅ |

## Scaling Strategy

### Maestro (Frontend)
```
Horizontal Scaling:
└→ CDN (CloudFlare, Cloudfront)
   • Static files cached globally
   • No server-side rendering needed
   
Load Distribution:
└→ Edge locations
   • Serve React bundle from nearest edge
   • < 100ms latency worldwide
```

### APA (Backend)
```
Horizontal Scaling:
├→ Multiple worker processes
│  └→ Gunicorn with 4-8 workers
│
├→ Multiple server instances
│  └→ Kubernetes pods (autoscaling)
│  └→ Load balancer (nginx/traefik)
│
└→ Task queue for long-running agents
   └→ Celery + Redis
   └→ Separate worker pool for agent execution
```

### Infrastructure
```
Database (PostgreSQL):
├→ Read replicas for queries
├→ Primary for writes
└→ Connection pooling (PgBouncer)

Vector DB:
├→ ChromaDB: Single instance (dev)
└→ Pinecone: Managed, auto-scales (prod)

LLM APIs:
└→ Rate limiting + caching
   └→ Cache identical reasoning requests
   └→ Respect API rate limits
```

## File Locations

```
Maestro Components:
  src/components/apa/ReasoningTraceViewer.tsx
  src/components/apa/AgentMemoryViewer.tsx
  src/components/apa/HITLApprovalCard.tsx
  src/components/layout/MaestroSidebar.tsx

Maestro Pages:
  src/pages/maestro/MaestroDashboard.tsx
  src/pages/maestro/MaestroAgents.tsx
  src/pages/AgentDetails.tsx
  src/pages/HITLDashboard.tsx

APA Services:
  backend/app/services/apa/agent_executor.py
  backend/app/services/apa/reasoning_engine.py
  backend/app/services/apa/context_manager.py
  backend/app/services/apa/safety_engine.py
  backend/app/services/apa/tool_registry.py
  backend/app/services/apa/vector_store.py

APA Models:
  backend/app/models/agent_reasoning.py
  backend/app/models/agent_memory.py
  backend/app/models/hitl.py

API Routes:
  backend/app/api/routes/apa.py
  backend/app/api/routes/agents.py

Schemas:
  backend/app/schemas/apa.py
```
