# 🏗️ Multi-Framework Execution Plane - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                               │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    React Flow Workflow Builder                         │ │
│  │  • Drag & drop nodes (Agent, Decision, Tool, Human, etc.)            │ │
│  │  • Connect nodes to define workflow logic                             │ │
│  │  • Visual editing and configuration                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │              EnhancedWorkflowBuilder Component                         │ │
│  │  • Real-time workflow analysis                                        │ │
│  │  • Framework recommendation engine                                    │ │
│  │  • Statistics display (nodes, agents, conditions, parallel paths)    │ │
│  │  • Execution controls                                                 │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                  FrameworkSelector Component                           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │ │
│  │  │LangChain │  │ CrewAI   │  │LangGraph │  │ Custom   │             │ │
│  │  │🔗 ReAct  │  │👥 Multi  │  │📊 State  │  │⚙️ Control│             │ │
│  │  │          │  │  Agent   │  │ Machine  │  │          │             │ │
│  │  │ • Pros   │  │ • Pros   │  │ • Pros   │  │ • Pros   │             │ │
│  │  │ • Cons   │  │ • Cons   │  │ • Cons   │  │ • Cons   │             │ │
│  │  │[Select]  │  │[Select]  │  │[Select]  │  │[Select]  │             │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘             │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   │ REST API (JSON)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER (FastAPI)                          │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    Workflow Execution Router                           │ │
│  │                                                                        │ │
│  │  POST /workflows/execute    ← Execute workflow with selected framework│ │
│  │  POST /workflows/analyze    ← Analyze & recommend framework          │ │
│  │  GET  /workflows/frameworks ← List all available frameworks          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                    ┌───────────────┼───────────────┐                        │
│                    ▼               ▼               ▼                        │
│         ┌────────────────┐  ┌────────────┐  ┌────────────┐                │
│         │  Framework     │  │ Framework  │  │ Framework  │                │
│         │   Routing      │  │ Validation │  │ Analytics  │                │
│         │   Logic        │  │ & Safety   │  │ Engine     │                │
│         └────────────────┘  └────────────┘  └────────────┘                │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRAMEWORK EXECUTION LAYER                               │
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │  LangChainExecutor  │  │  CrewOrchestrator   │  │  WorkflowEngine     │ │
│  │  ┌───────────────┐  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │ │
│  │  │ ReAct Pattern │  │  │  │  Multi-Agent  │  │  │  │ State Machine │  │ │
│  │  │               │  │  │  │  Coordination │  │  │  │               │  │ │
│  │  │ 1. Thought    │  │  │  │               │  │  │  │ Graph Builder │  │ │
│  │  │ 2. Action     │  │  │  │ Sequential/   │  │  │  │               │  │ │
│  │  │ 3. Observation│  │  │  │ Hierarchical  │  │  │  │ Conditional   │  │ │
│  │  │ 4. Repeat     │  │  │  │ Processes     │  │  │  │ Routing       │  │ │
│  │  │               │  │  │  │               │  │  │  │               │  │ │
│  │  │ • OpenAI      │  │  │  │ • Shared Mem  │  │  │  │ • Checkpoints │  │ │
│  │  │ • Anthropic   │  │  │  │ • Role-based  │  │  │  │ • Cycles OK   │  │ │
│  │  │ • Tools       │  │  │  │ • Delegation  │  │  │  │ • Persistence │  │ │
│  │  └───────────────┘  │  │  └───────────────┘  │  │  └───────────────┘  │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│              │                       │                       │               │
│              └───────────────────────┼───────────────────────┘               │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        SHARED SERVICES                                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │ │
│  │  │SafetyEngine  │  │ContextManager│  │ToolRegistry  │                │ │
│  │  │              │  │              │  │              │                │ │
│  │  │• Risk Check  │  │• Memory Store│  │• Tool Lookup │                │ │
│  │  │• HITL Queue  │  │• Context Load│  │• Tool Execute│                │ │
│  │  │• Validation  │  │• Learning    │  │• Tool Adapt  │                │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA PERSISTENCE LAYER                             │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  PostgreSQL  │  │   ChromaDB   │  │    Redis     │  │  File Store  │   │
│  │              │  │              │  │              │  │              │   │
│  │ • Workflows  │  │ • Vectors    │  │ • Cache      │  │ • Artifacts  │   │
│  │ • Agents     │  │ • Embeddings │  │ • Sessions   │  │ • Logs       │   │
│  │ • Executions │  │ • Memory     │  │ • Queue      │  │ • Traces     │   │
│  │ • Traces     │  │ • RAG Index  │  │ • Locks      │  │ • Exports    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Workflow Analysis Flow
```
User builds workflow in UI
    │
    ▼
EnhancedWorkflowBuilder captures nodes/edges
    │
    ▼
Auto-analysis triggered:
  • Count nodes and agents
  • Detect conditions
  • Detect parallel paths
    │
    ▼
Recommendation engine:
  IF single agent → LangChain
  IF multi-agent → CrewAI
  IF complex logic → LangGraph
  ELSE → Custom
    │
    ▼
Display recommendation to user
```

### 2. Workflow Execution Flow
```
User clicks "Execute Workflow"
    │
    ▼
Frontend sends to POST /workflows/execute
    │
    ▼
API Router receives request
    │
    ├─ Extract framework parameter
    ├─ Validate nodes/edges
    └─ Initialize services (SafetyEngine, ContextManager)
    │
    ▼
Route to appropriate executor:
    │
    ├─ framework == "langchain" → LangChainExecutor
    ├─ framework == "crewai" → CrewOrchestrator
    ├─ framework == "langgraph" → WorkflowEngine
    └─ framework == "custom" → AgentExecutor
    │
    ▼
Executor processes workflow:
    │
    ├─ Transform nodes to framework format
    ├─ Build execution graph/crew/agent
    ├─ Safety check (HITL if needed)
    ├─ Execute with LLM
    └─ Collect metrics (tokens, cost, time)
    │
    ▼
Store execution context for learning
    │
    ▼
Return results to frontend
    │
    ▼
Display output, metrics, and trace
```

## Component Interactions

### Frontend ↔ Backend
```typescript
// Frontend sends
{
  framework: "langchain",
  nodes: [{id: "1", type: "agent", data: {...}}],
  edges: [{source: "1", target: "2"}],
  input: {input: "user query"}
}

// Backend responds
{
  status: "success",
  output: "Agent's response",
  metrics: {
    execution_time: 2.5,
    total_tokens: 850,
    total_cost: 0.034
  },
  trace: {...}
}
```

### Framework Selection Logic
```python
def suggest_framework(nodes, edges):
    agent_count = count_agents(nodes)
    has_conditions = detect_conditions(nodes, edges)
    has_parallel = detect_parallel_paths(nodes, edges)
    
    if len(nodes) == 1 or agent_count == 1:
        return "langchain"
    
    if has_conditions and has_parallel:
        return "langgraph"
    
    if agent_count > 1:
        return "crewai"
    
    if has_conditions:
        return "langgraph"
    
    return "custom"
```

## Framework Comparison

| Feature | LangChain | CrewAI | LangGraph | Custom |
|---------|-----------|---------|-----------|--------|
| **Pattern** | ReAct | Multi-Agent | State Machine | Custom |
| **Best For** | Single agent | Collaboration | Complex logic | Full control |
| **Complexity** | Low | Medium | High | Low |
| **Setup Time** | Fast | Medium | Slow | Fast |
| **Flexibility** | Medium | Low | High | Highest |
| **Community** | Largest | Growing | Growing | N/A |
| **Memory** | Built-in | Shared | Persistent | Custom |
| **Tools** | 100+ | Limited | Limited | Custom |
| **Learning Curve** | Easy | Medium | Steep | Depends |

## Technology Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **React Flow** - Visual workflow builder
- **TailwindCSS** - Styling

### Backend
- **FastAPI** - Web framework
- **Python 3.13** - Runtime
- **SQLAlchemy** - ORM
- **Pydantic** - Validation

### AI Frameworks
- **LangChain** - ReAct agents
- **CrewAI** - Multi-agent
- **LangGraph** - State machines
- **OpenAI/Anthropic** - LLM providers

### Storage
- **PostgreSQL** - Primary database
- **ChromaDB** - Vector database
- **Redis** - Caching/queues

## Security & Safety

```
Every execution goes through:
    │
    ▼
┌────────────────────┐
│   SafetyEngine     │
│                    │
│ 1. Risk Assessment │
│ 2. Policy Check    │
│ 3. HITL if needed  │
└────────────────────┘
    │
    ▼
┌────────────────────┐
│   Execute if OK    │
└────────────────────┘
```

## Metrics & Observability

```
Every execution tracks:
    │
    ├─ Execution time
    ├─ Token usage
    ├─ Cost calculation
    ├─ Step-by-step trace
    ├─ Intermediate results
    └─ Error details (if any)
    │
    ▼
Stored in database for:
    │
    ├─ Analysis
    ├─ Optimization
    ├─ Learning
    └─ Debugging
```

## Extensibility

### Adding a New Framework

```
1. Create executor service
   └─ backend/app/services/apa/new_executor.py
   
2. Add to API router
   └─ backend/app/api/v1/endpoints/workflow_execution.py
   
3. Add frontend config
   └─ src/lib/workflow-frameworks.ts
   
4. Done! Framework is now available
```

---

**Architecture designed for:**
- ✅ Flexibility (4 frameworks supported)
- ✅ Safety (integrated SafetyEngine)
- ✅ Scalability (async execution)
- ✅ Observability (metrics & traces)
- ✅ Extensibility (easy to add frameworks)
- ✅ Developer Experience (visual builder + auto-recommendations)
