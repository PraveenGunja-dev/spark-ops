# Spark-Ops Quick Reference

## 🎯 What is What?

| Term | What It Is | Example |
|------|-----------|---------|
| **Spark-Ops** | The overall platform name | "We use Spark-Ops for AI automation" |
| **Maestro** | User interface & platform layer | "Log into Maestro to manage agents" |
| **APA** | Execution engine underneath | "APA handles the reasoning and tool execution" |

## 🏗️ Architecture in One Sentence

**Maestro is the cockpit where you control agents, APA is the engine that runs them.**

## 📂 Project Structure

```
spark-ops/
├── src/                          # MAESTRO (Frontend)
│   ├── components/
│   │   ├── layout/
│   │   │   └── MaestroSidebar.tsx    # Main navigation
│   │   └── apa/
│   │       ├── ReasoningTraceViewer.tsx   # Shows agent thinking
│   │       ├── AgentMemoryViewer.tsx      # Shows agent memory
│   │       └── HITLApprovalCard.tsx       # Approval UI
│   ├── pages/
│   │   ├── Index.tsx                 # Landing page
│   │   ├── maestro/
│   │   │   ├── MaestroDashboard.tsx  # Main dashboard
│   │   │   ├── MaestroAgents.tsx     # Agent list
│   │   │   └── ...
│   │   ├── AgentDetails.tsx          # Agent details page
│   │   └── HITLDashboard.tsx         # HITL approvals
│   └── App.tsx                       # Main router
│
└── backend/                      # APA (Execution Engine)
    └── app/
        ├── services/apa/
        │   ├── agent_executor.py         # Main orchestration
        │   ├── reasoning_engine.py       # LLM reasoning
        │   ├── context_manager.py        # Memory management
        │   ├── safety_engine.py          # Guardrails
        │   ├── tool_registry.py          # Tool execution
        │   └── vector_store.py           # Vector DB
        ├── models/
        │   ├── agent_reasoning.py        # Reasoning trace model
        │   ├── agent_memory.py           # Memory model
        │   └── hitl.py                   # HITL model
        ├── schemas/apa.py                # API schemas
        └── api/routes/apa.py             # API endpoints
```

## 🛣️ Main Routes

| Route | What It Shows | Purpose |
|-------|--------------|---------|
| `/` | Landing page | Introduction to Spark-Ops |
| `/login` | Login form | User authentication |
| `/maestro` | Dashboard | Main hub - agent overview |
| `/maestro/agents` | Agent list | Browse all AI agents |
| `/maestro/agents/:id` | Agent details | View agent config, traces, memory |
| `/maestro/workflows` | Workflows | Autonomous workflow orchestration |
| `/maestro/observability` | Monitoring | Real-time performance metrics |
| `/maestro/hitl` | HITL Dashboard | Approve/reject high-risk actions |
| `/maestro/governance` | Governance | Safety policies and rules |
| `/maestro/integrations` | Integrations | External tool connections |
| `/maestro/settings` | Settings | Platform configuration |

## 🔌 Key API Endpoints

### Agent Management
```
GET    /api/agents              # List all agents
POST   /api/agents              # Create new agent
GET    /api/agents/{id}         # Get agent details
PUT    /api/agents/{id}         # Update agent
DELETE /api/agents/{id}         # Delete agent
```

### Agent Execution (APA)
```
POST   /api/apa/runs                    # Start agent run
GET    /api/apa/runs/{run_id}           # Get run status
GET    /api/apa/runs/{run_id}/traces    # Get reasoning traces
POST   /api/apa/runs/{run_id}/cancel    # Cancel run
```

### Memory (APA)
```
POST   /api/apa/memory                  # Store memory
GET    /api/apa/memory/{agent_id}       # Get agent memories
POST   /api/apa/memory/search           # Semantic search
```

### HITL (APA)
```
GET    /api/apa/hitl/pending            # Get pending approvals
POST   /api/apa/hitl/{id}/approve       # Approve action
POST   /api/apa/hitl/{id}/reject        # Reject action
```

### Tools (APA)
```
GET    /api/apa/tools                   # List available tools
POST   /api/apa/tools/{name}/execute    # Execute tool
POST   /api/apa/tools/register          # Register custom tool
```

## 🔑 Environment Variables

### Required for LLM Reasoning
```env
OPENAI_API_KEY=sk-...              # OpenAI GPT-4 access
ANTHROPIC_API_KEY=sk-ant-...       # Anthropic Claude access (optional)
```

### Required for Database
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/sparkops
```

### Optional - Vector Store
```env
VECTOR_STORE_TYPE=chromadb         # or 'pinecone'
CHROMADB_PATH=./data/chromadb      # for ChromaDB
PINECONE_API_KEY=...               # for Pinecone
PINECONE_ENVIRONMENT=...           # for Pinecone
```

### Optional - APA Configuration
```env
MAX_REASONING_ITERATIONS=10
DEFAULT_EMBEDDING_MODEL=text-embedding-3-small
ENABLE_AGENT_LEARNING=True
ENABLE_HITL=True
```

## 🗄️ Database Tables

| Table | Purpose | Key Columns |
|-------|---------|------------|
| `agents` | Agent configurations | id, name, llm_provider, tools |
| `agent_runs` | Execution instances | id, agent_id, status, outputs |
| `agent_reasoning_traces` | ReAct steps | thought, action, observation, reflection |
| `agent_memory` | Semantic memory | content, embedding, importance_score |
| `hitl_requests` | Approval queue | action_type, risk_level, status |
| `agent_collaborations` | Multi-agent work | initiator_id, collaborator_id |
| `agent_learning_feedback` | Learning data | feedback_type, lessons_learned |

## 🧰 APA Core Services

| Service | File | Purpose |
|---------|------|---------|
| Agent Executor | `agent_executor.py` | Main orchestration loop |
| Reasoning Engine | `reasoning_engine.py` | LLM calls & ReAct pattern |
| Context Manager | `context_manager.py` | Memory storage/retrieval |
| Safety Engine | `safety_engine.py` | Guardrails & risk checks |
| Tool Registry | `tool_registry.py` | Tool execution |
| Vector Store | `vector_store.py` | Semantic search |

## 🧠 ReAct Loop (How Agents Think)

```
1. THOUGHT
   "I need to fetch customer data from the database"
   
2. ACTION
   Tool: run_sql
   Parameters: {query: "SELECT * FROM customers WHERE id = 123"}
   
3. OBSERVATION
   Result: {name: "John Doe", email: "john@example.com", ...}
   
4. REFLECTION
   "Successfully retrieved customer data. Now I'll analyze sentiment."
   
→ REPEAT until goal achieved or max iterations
```

## 🛡️ Risk Levels

| Level | Description | Action |
|-------|-------------|--------|
| **LOW** | Read-only operations | Auto-execute |
| **MEDIUM** | Standard operations | Auto-execute with logging |
| **HIGH** | Sensitive operations | Require HITL approval |
| **CRITICAL** | Dangerous operations | Block or require multi-approval |

## 🧪 Built-in Tools

| Tool Name | Purpose | Example |
|-----------|---------|---------|
| `web_search` | Search internet | "Find latest news about AI" |
| `http_request` | Make HTTP calls | GET/POST to external APIs |
| `run_sql` | Execute SQL | Query databases |
| `execute_python` | Run Python code | Data processing |
| `send_email` | Send emails | Notifications |
| `read_file` | File access | Read logs, configs |

## 📊 Components for Visualization

| Component | Purpose | Location |
|-----------|---------|----------|
| `ReasoningTraceViewer` | Shows thought→action→observation | `src/components/apa/` |
| `AgentMemoryViewer` | Displays semantic memories | `src/components/apa/` |
| `HITLApprovalCard` | HITL approval UI | `src/components/apa/` |

## 🚀 Common Commands

### Development
```bash
# Frontend (Maestro UI)
npm install
npm run dev                    # Start at http://localhost:5173

# Backend (APA Engine)
cd backend
pip install -r requirements.txt
alembic upgrade head           # Run migrations
uvicorn app.main:app --reload  # Start at http://localhost:8000
```

### Testing
```bash
# Frontend
npm run test

# Backend
cd backend
pytest
```

### Production Build
```bash
# Frontend
npm run build                  # Creates dist/ folder

# Backend
docker build -t spark-ops-backend ./backend
docker run -p 8000:8000 spark-ops-backend
```

## 🔗 Documentation Links

| Document | Purpose |
|----------|---------|
| [MAESTRO_APA_RELATIONSHIP.md](./MAESTRO_APA_RELATIONSHIP.md) | Understanding the two layers |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete technical architecture |
| [APA_IMPLEMENTATION_COMPLETE.md](./APA_IMPLEMENTATION_COMPLETE.md) | Full APA implementation details |
| [README.md](./README.md) | Main project readme |

## 💡 Quick Tips

### For Frontend Development (Maestro)
- Use shadcn-ui components for consistency
- All routes should be wrapped in `<MaestroLayout>`
- Use React Query for API calls
- Keep API calls in separate hooks

### For Backend Development (APA)
- All APA services are async
- Use dependency injection for services
- Return Pydantic schemas from endpoints
- Store reasoning traces for observability

### For Documentation
- **Maestro** = Interface/Platform
- **APA** = Execution Engine
- Use both terms correctly in context

## 🎯 Most Common Tasks

### Add a New Tool
1. Create tool handler in `backend/app/services/apa/tool_registry.py`
2. Register in `get_tool_registry()`
3. Test with agent run

### Create a New Agent
1. POST to `/api/agents` with config
2. Include: name, llm_provider, llm_model, tools array
3. Verify in Maestro UI at `/maestro/agents`

### Approve HITL Request
1. Navigate to `/maestro/hitl`
2. Review pending request details
3. Click Approve/Reject
4. Agent resumes execution

### View Reasoning Traces
1. Go to `/maestro/agents/{agent_id}`
2. Click on a completed run
3. View step-by-step reasoning in traces tab

---

**Need more details?** Check the full [Architecture Guide](./ARCHITECTURE.md) or [Maestro + APA Relationship](./MAESTRO_APA_RELATIONSHIP.md) document.
