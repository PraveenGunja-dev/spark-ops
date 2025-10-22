# Spark-Ops Architecture

## 🎯 Platform Overview

**Spark-Ops** is built on a two-layer architecture:

- **Maestro** (Platform Layer) - User-facing interface for managing AI agents
- **APA** (Execution Layer) - Intelligent runtime engine that powers agent execution

This separation of concerns allows for a clean, maintainable architecture where the interface layer (Maestro) can evolve independently from the execution engine (APA).

## 🏗️ Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MAESTRO (Platform Layer)                  │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Dashboard  │  │  Agents  │  │   HITL   │  │   Obs.   │ │
│  └────────────┘  └──────────┘  └──────────┘  └──────────┘ │
│  User Interface • Configuration • Monitoring • Analytics    │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    APA (Execution Layer)                     │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │   Reasoning  │  │  Context   │  │   Tool Registry    │ │
│  │    Engine    │  │  Manager   │  │                    │ │
│  └──────────────┘  └────────────┘  └────────────────────┘ │
│  ┌──────────────┐  ┌────────────┐                         │
│  │    Safety    │  │   Agent    │                         │
│  │    Engine    │  │  Executor  │                         │
│  └──────────────┘  └────────────┘                         │
│  ReAct • Memory • Tools • Safety • Execution Runtime       │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │  PostgreSQL  │  │  ChromaDB  │  │   OpenAI/Claude    │ │
│  │   +pgvector  │  │  /Pinecone │  │   LLM Providers    │ │
│  └──────────────┘  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Maestro - Platform Layer

### Purpose
Maestro is the **control center** where users interact with AI agents. It provides the interface, configuration, and observability tools needed to manage autonomous agents at scale.

### Key Components

#### 1. **Dashboard** (`/maestro`)
- Real-time agent status overview
- Performance metrics and KPIs
- Recent activity feed
- System health indicators

#### 2. **AI Agents** (`/maestro/agents`)
- Agent configuration and management
- Agent lifecycle (create, deploy, pause, delete)
- Agent details with reasoning traces (`/maestro/agents/:id`)
- Memory viewer and semantic search

#### 3. **Workflows** (`/maestro/workflows`)
- Autonomous workflow orchestration
- Multi-agent collaboration setup
- Workflow templates and patterns

#### 4. **Observability** (`/maestro/observability`)
- Real-time trace visualization
- Performance monitoring
- Token usage tracking
- Latency analysis

#### 5. **Human-in-the-Loop (HITL)** (`/maestro/hitl`)
- High-risk action approvals
- Pending request queue
- Approval/rejection history
- Audit trail

#### 6. **Governance** (`/maestro/governance`)
- Safety policies and guardrails
- Compliance rules
- Risk classification
- Access controls

#### 7. **Integrations** (`/maestro/integrations`)
- External tool connections
- API configurations
- Custom tool registry

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **UI Library**: shadcn-ui + Tailwind CSS
- **State Management**: React Query + Zustand
- **Routing**: React Router v6

## ⚙️ APA - Execution Layer

### Purpose
APA is the **intelligent engine** that powers agent execution. It handles reasoning, memory, tool execution, and safety—enabling agents to act autonomously while maintaining control and observability.

### Core Services

#### 1. **Agent Executor** (`agent_executor.py`)
**Role**: Main orchestration loop for agent execution

**Responsibilities**:
- Execute agent runs from start to completion
- Coordinate between reasoning, context, and tools
- Manage agent state transitions
- Handle errors and retries

**Key Methods**:
```python
async def execute_run(run_id: UUID, agent_id: UUID, max_iterations: int = 10)
async def execute_step(step_index: int, context: Dict)
async def finalize_run(status: str, outputs: Dict)
```

#### 2. **Reasoning Engine** (`reasoning_engine.py`)
**Role**: LLM-powered decision making using ReAct pattern

**Responsibilities**:
- Generate agent thoughts and actions
- Parse LLM responses into structured decisions
- Support multiple LLM providers (OpenAI, Anthropic)
- Track reasoning traces and token usage

**ReAct Loop**:
1. **Thought**: Analyze current situation
2. **Action**: Decide what to do next
3. **Observation**: Receive action results
4. **Reflection**: Learn from outcomes

**Key Methods**:
```python
async def reason(agent_config: Dict, context: Dict, history: List)
async def reason_with_openai(prompt: str, model: str, temperature: float)
async def reason_with_anthropic(prompt: str, model: str, max_tokens: int)
def _parse_react_response(llm_output: str) -> Dict
```

#### 3. **Context Manager** (`context_manager.py`)
**Role**: Semantic memory and knowledge retrieval

**Responsibilities**:
- Store agent memories with embeddings
- Retrieve relevant context using vector search
- Manage short-term and long-term memory
- Calculate memory importance scores

**Memory Types**:
- **Episodic**: Specific experiences and events
- **Semantic**: General knowledge and facts
- **Procedural**: Skills and how-to knowledge

**Key Methods**:
```python
async def store_memory(agent_id: UUID, content: str, memory_type: str, importance: float)
async def retrieve_memories(agent_id: UUID, query: str, limit: int)
async def get_relevant_context(agent_id: UUID, current_goal: str)
```

#### 4. **Safety Engine** (`safety_engine.py`)
**Role**: Guardrails and compliance enforcement

**Responsibilities**:
- Classify action risk levels (LOW, MEDIUM, HIGH, CRITICAL)
- Enforce safety policies
- Trigger HITL approvals for high-risk actions
- Log safety violations

**Risk Levels**:
- **LOW**: Read-only operations (safe to execute)
- **MEDIUM**: Standard operations (monitored)
- **HIGH**: Sensitive operations (requires HITL approval)
- **CRITICAL**: Dangerous operations (blocked or requires multi-approval)

**Key Methods**:
```python
def classify_action_risk(action: Dict, policies: List[Dict]) -> str
async def check_safety(action: Dict, agent_id: UUID) -> Dict
async def enforce_policies(action: Dict, agent_config: Dict) -> bool
```

#### 5. **Tool Registry** (`tool_registry.py`)
**Role**: Extensible tool ecosystem

**Built-in Tools**:
- `web_search` - Search the internet
- `http_request` - Make HTTP calls
- `run_sql` - Execute SQL queries
- `execute_python` - Run Python code
- `send_email` - Email notifications
- `read_file` - File system access

**Key Methods**:
```python
def register_tool(name: str, handler: Callable, schema: Dict)
async def execute_tool(tool_name: str, parameters: Dict)
def get_tool_schema(tool_name: str) -> Dict
def list_available_tools() -> List[str]
```

#### 6. **Vector Store** (`vector_store.py`)
**Role**: Semantic search and embeddings

**Responsibilities**:
- Generate embeddings using OpenAI
- Store vectors in ChromaDB/Pinecone
- Perform similarity search
- Manage vector collections

**Key Methods**:
```python
async def generate_embedding(text: str, model: str)
async def add_memory(id: str, text: str, metadata: Dict)
async def search_similar(query: str, limit: int, filter_metadata: Dict)
```

### Technology Stack
- **Backend**: FastAPI + Python 3.11+
- **Database**: PostgreSQL 13+ with pgvector extension
- **Vector DB**: ChromaDB (dev) / Pinecone (prod)
- **LLM Providers**: OpenAI GPT-4 / Anthropic Claude
- **ORM**: SQLAlchemy + Alembic
- **Framework**: LangChain (optional utilities)

## 🗄️ Database Schema

### Core Tables

#### 1. **agents**
Stores agent configurations and metadata
```sql
- id (UUID, PK)
- name, description
- type (react, reflexion, plan_and_solve)
- llm_provider (openai, anthropic)
- llm_model (gpt-4, claude-3-opus)
- system_prompt
- tools (JSONB array)
- enabled (boolean)
- created_at, updated_at
```

#### 2. **agent_runs**
Tracks agent execution instances
```sql
- id (UUID, PK)
- agent_id (FK)
- status (pending, running, completed, failed)
- inputs, outputs (JSONB)
- start_time, end_time
- total_tokens_used
- total_latency_ms
```

#### 3. **agent_reasoning_traces**
Stores ReAct reasoning steps
```sql
- id (UUID, PK)
- run_id (FK)
- agent_id (FK)
- step_index (int)
- thought (text)
- action (JSONB)
- observation (JSONB)
- reflection (text)
- tokens_used, latency_ms
```

#### 4. **agent_memory**
Semantic memory with embeddings
```sql
- id (UUID, PK)
- agent_id (FK)
- memory_type (episodic, semantic, procedural)
- content (text)
- embedding (ARRAY[float])
- importance_score (float)
- created_at, last_accessed
```

#### 5. **hitl_requests**
Human-in-the-loop approvals
```sql
- id (UUID, PK)
- run_id (FK)
- agent_id (FK)
- action_type, action_payload (JSONB)
- risk_level (low, medium, high, critical)
- status (pending, approved, rejected)
- reason (text)
- requested_at, responded_at
```

#### 6. **agent_collaborations**
Multi-agent interactions
```sql
- id (UUID, PK)
- initiator_agent_id (FK)
- collaborator_agent_id (FK)
- collaboration_type (handoff, parallel, feedback)
- shared_context (JSONB)
- created_at
```

#### 7. **agent_learning_feedback**
Learning and improvement data
```sql
- id (UUID, PK)
- run_id (FK)
- agent_id (FK)
- feedback_type (success, failure, correction)
- input_context, expected_output, actual_output (JSONB)
- feedback_score (float)
- lessons_learned (text)
```

## 🔄 Execution Flow

### Agent Run Lifecycle

```
1. USER REQUEST
   ↓
2. MAESTRO UI
   └→ Create agent run with inputs
      ↓
3. APA: AGENT EXECUTOR
   └→ Initialize run, load agent config
      ↓
4. APA: REASONING ENGINE
   └→ Generate thought and action (LLM call)
      ↓
5. APA: SAFETY ENGINE
   └→ Check if action is safe
      ├→ HIGH RISK: Create HITL request → Wait for approval
      └→ LOW/MEDIUM: Proceed
      ↓
6. APA: TOOL REGISTRY
   └→ Execute action/tool
      ↓
7. APA: CONTEXT MANAGER
   └→ Store memory, retrieve relevant context
      ↓
8. LOOP: Steps 4-7 until goal achieved or max iterations
      ↓
9. APA: AGENT EXECUTOR
   └→ Finalize run, store outputs
      ↓
10. MAESTRO UI
    └→ Display results, reasoning traces
```

## 🔌 API Endpoints

### APA Endpoints

#### Agent Execution
- `POST /api/apa/runs` - Create new agent run
- `GET /api/apa/runs/{run_id}` - Get run status
- `GET /api/apa/runs/{run_id}/traces` - Get reasoning traces
- `POST /api/apa/runs/{run_id}/cancel` - Cancel running agent

#### Reasoning
- `POST /api/apa/reasoning/reason` - Manual reasoning call
- `GET /api/apa/reasoning/traces/{run_id}` - Get all reasoning steps

#### Memory
- `POST /api/apa/memory` - Store new memory
- `GET /api/apa/memory/{agent_id}` - Retrieve memories
- `POST /api/apa/memory/search` - Semantic search

#### HITL
- `GET /api/apa/hitl/pending` - Get pending approvals
- `POST /api/apa/hitl/{request_id}/approve` - Approve action
- `POST /api/apa/hitl/{request_id}/reject` - Reject action

#### Tools
- `GET /api/apa/tools` - List available tools
- `POST /api/apa/tools/{tool_name}/execute` - Execute tool
- `POST /api/apa/tools/register` - Register custom tool

#### Learning
- `POST /api/apa/learning/feedback` - Submit feedback
- `GET /api/apa/learning/insights/{agent_id}` - Get learned insights

## 🔐 Security & Safety

### Safety Layers

1. **Policy Engine**
   - Pre-defined safety policies
   - Custom organizational rules
   - Industry compliance (GDPR, HIPAA, SOC2)

2. **Risk Classification**
   - Automatic action risk scoring
   - Context-aware risk assessment
   - Escalation triggers

3. **HITL Approvals**
   - Human approval workflows
   - Multi-level approvals for critical actions
   - Time-boxed approval windows

4. **Audit Trail**
   - Complete action logging
   - Reasoning trace preservation
   - Compliance reporting

5. **Rate Limiting**
   - Tool execution limits
   - API call throttling
   - Resource quotas per agent

## 📊 Monitoring & Observability

### Metrics Tracked

- **Performance**: Latency, throughput, success rate
- **Costs**: Token usage, API calls, compute time
- **Quality**: Action accuracy, goal completion rate
- **Safety**: Policy violations, HITL trigger rate
- **Learning**: Memory growth, improvement trends

### Visualization Components

- **Reasoning Trace Viewer**: Step-by-step decision visualization
- **Memory Viewer**: Semantic memory explorer
- **HITL Dashboard**: Approval queue management
- **Agent Performance**: Metrics and analytics

## 🚀 Deployment

### Development
```bash
# Frontend
npm run dev

# Backend
cd backend
uvicorn app.main:app --reload
```

### Production

**Frontend** (Vercel/Netlify):
```bash
npm run build
# Deploy dist/ folder
```

**Backend** (Docker):
```bash
docker build -t spark-ops-backend ./backend
docker run -p 8000:8000 spark-ops-backend
```

**Database**:
- Managed PostgreSQL (AWS RDS, Supabase, etc.)
- pgvector extension enabled

**Vector Store**:
- ChromaDB (development)
- Pinecone (production)

## 📚 Further Reading

- [APA Implementation Complete](./APA_IMPLEMENTATION_COMPLETE.md) - Full implementation details
- [APA Conversion Roadmap](./APA_CONVERSION_ROADMAP.md) - 16-week plan
- [Migration Guide](./MIGRATION_TO_APA_ONLY.md) - Platform evolution
- [README](./README.md) - Quick start guide
