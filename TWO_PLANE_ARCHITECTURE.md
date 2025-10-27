# Two-Plane Architecture Diagram

## 🏗️ Spark-Ops: Control Plane + Execution Plane

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          USER / DEVELOPER                                  │
│                         (Maestro Interface)                                │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↕ HTTP/REST
┌───────────────────────────────────────────────────────────────────────────┐
│                         🎛️ CONTROL PLANE                                  │
│                    (Management & Orchestration API)                        │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                        FastAPI Application                            │ │
│  │                         (Port 8000)                                   │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌────────────┬────────────┬────────────┬────────────┬───────────────┐   │
│  │   Auth     │  Projects  │   Agents   │   Tools    │   Workflows   │   │
│  │   API      │    API     │    API     │    API     │      API      │   │
│  │            │            │            │            │               │   │
│  │ • Login    │ • Create   │ • Create   │ • Create   │ • Create      │   │
│  │ • Register │ • List     │ • List     │ • List     │ • List        │   │
│  │ • Refresh  │ • Update   │ • Update   │ • Update   │ • Update      │   │
│  │ • API Keys │ • Delete   │ • Delete   │ • Delete   │ • Delete      │   │
│  │            │ • Search   │ • Health   │ • Test     │ • Versions    │   │
│  └────────────┴────────────┴────────────┴────────────┴───────────────┘   │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                          Runs API                                   │   │
│  │  • Trigger runs  • List runs  • Cancel  • Get steps                │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                   Business Logic Services                           │   │
│  │  • ProjectService  • AgentService  • ToolService                   │   │
│  │  • WorkflowService • RunService    • UserService                   │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↕
                          Control Plane calls APA
                                    ↕
┌───────────────────────────────────────────────────────────────────────────┐
│                         ⚙️ EXECUTION PLANE (APA)                          │
│                    (Agentic Process Automation)                            │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                        APA API Endpoints                              │ │
│  │  /api/apa/agents/{id}/reason  • /api/apa/memory/*                   │ │
│  │  /api/apa/hitl/*              • /api/apa/tools/*                     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                     🧠 AGENT EXECUTOR                               │   │
│  │                  (Main Orchestration Loop)                          │   │
│  │                                                                     │   │
│  │  • Manages agent run lifecycle                                     │   │
│  │  • Coordinates all APA services                                    │   │
│  │  • Implements ReAct pattern (Thought → Action → Observation)      │   │
│  │  • Handles errors and retries                                      │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                 ↕                                          │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐   │
│  │  Reasoning   │   Context    │    Safety    │    Tool              │   │
│  │   Engine     │   Manager    │    Engine    │   Registry           │   │
│  │              │              │              │                      │   │
│  │ • OpenAI     │ • Memory     │ • Risk       │ • web_search         │   │
│  │   GPT-4      │   Storage    │   Classify   │ • http_request       │   │
│  │ • Anthropic  │ • Semantic   │ • HITL       │ • run_sql            │   │
│  │   Claude     │   Search     │   Trigger    │ • execute_python     │   │
│  │ • ReAct      │ • Vector     │ • Policy     │ • send_email         │   │
│  │   Parsing    │   Embed      │   Enforce    │ • read_file          │   │
│  └──────────────┴──────────────┴──────────────┴──────────────────────┘   │
│                                 ↕                                          │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                        🗄️ VECTOR STORE                             │   │
│  │                                                                     │   │
│  │  • ChromaDB (development)                                          │   │
│  │  • Pinecone (production)                                           │   │
│  │  • OpenAI embeddings (text-embedding-3-small)                      │   │
│  │  • Semantic memory retrieval                                       │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↕
                        Both planes access Database
                                    ↕
┌───────────────────────────────────────────────────────────────────────────┐
│                          💾 DATA LAYER                                    │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                      PostgreSQL Database                            │   │
│  │                                                                     │   │
│  │  Control Plane Tables:                                             │   │
│  │  • users                 • projects              • agents          │   │
│  │  • tools                 • workflows             • workflow_executions  │
│  │  • workflow_steps                                                  │   │
│  │                                                                     │   │
│  │  Execution Plane (APA) Tables:                                     │   │
│  │  • agent_reasoning_traces    • agent_memory                       │   │
│  │  • hitl_requests            • agent_collaborations                │   │
│  │  • agent_learning_feedback                                         │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                        Redis (Optional)                             │   │
│  │  • Rate limiting          • Session storage                        │   │
│  │  • Task queue             • Caching                                │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↕
                        External Integrations
                                    ↕
┌───────────────────────────────────────────────────────────────────────────┐
│                      🌐 EXTERNAL SERVICES                                 │
│                                                                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐   │
│  │   OpenAI     │  Anthropic   │   ChromaDB   │   External APIs      │   │
│  │   GPT-4      │   Claude     │  / Pinecone  │   (via Tools)        │   │
│  │              │              │              │                      │   │
│  │ • Chat       │ • Messages   │ • Vector     │ • HTTP calls         │   │
│  │ • Embeddings │ • Streaming  │   Storage    │ • Database queries   │   │
│  └──────────────┴──────────────┴──────────────┴──────────────────────┘   │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Execution Flow: Creating and Running an Agent

```
STEP 1: User Creates Agent (via Maestro UI)
    ↓
STEP 2: CONTROL PLANE receives request
    └→ POST /api/v1/agents/
    └→ AgentService.create_agent()
    └→ Store in database (agents table)
    └→ Return agent_id
    ↓
STEP 3: User Triggers Run
    └→ POST /api/v1/runs/
    └→ RunService.create_run()
    └→ Store in database (workflow_executions table)
    ↓
STEP 4: CONTROL PLANE invokes APA
    └→ POST /api/apa/agents/{agent_id}/reason
    ↓
STEP 5: EXECUTION PLANE (APA) takes over
    └→ AgentExecutor.execute_task()
    
    ┌─────────────────────────────────────┐
    │      ReAct Loop Begins              │
    └─────────────────────────────────────┘
    
    ITERATION 1:
    ├→ ReasoningEngine.reason()
    │  └→ Calls OpenAI GPT-4
    │  └→ Returns: Thought + Action
    │
    ├→ SafetyEngine.check_safety()
    │  └→ Classifies risk level
    │  └→ If HIGH: creates HITL request
    │  └→ If LOW/MEDIUM: proceeds
    │
    ├→ ToolRegistry.execute_tool()
    │  └→ Executes the action
    │  └→ Returns observation
    │
    └→ ContextManager.store_memory()
       └→ Stores memory with embedding
       └→ VectorStore.add_memory()
    
    ┌─────────────────────────────────────┐
    │   If HITL triggered:                 │
    │   • Execution PAUSES                 │
    │   • User sees notification in Maestro│
    │   • User approves/rejects            │
    │   • Execution RESUMES                │
    └─────────────────────────────────────┘
    
    ITERATION 2, 3, ..., N:
    └→ Repeat ReAct loop until:
       • Goal achieved (action = "FINISH")
       • Max iterations reached
       • Critical error occurs
    ↓
STEP 6: APA completes execution
    └→ AgentExecutor.finalize()
    └→ Store final results in database
    └→ Return execution summary
    ↓
STEP 7: CONTROL PLANE receives results
    └→ Update workflow_executions table
    └→ Update workflow_steps table
    ↓
STEP 8: Maestro UI displays results
    └→ Run status updated
    └→ Reasoning traces visible
    └→ Metrics displayed
```

---

## 🔑 Key Differences: Control Plane vs Execution Plane

| Aspect | Control Plane | Execution Plane (APA) |
|--------|--------------|----------------------|
| **Purpose** | Manage & orchestrate | Execute & reason |
| **Who uses it** | Developers & operators | AI agents |
| **Technology** | REST API (CRUD) | Intelligent runtime |
| **Main entities** | Projects, Agents, Workflows, Tools | Tasks, Reasoning, Memory |
| **Endpoints** | `/api/v1/*` | `/api/apa/*` |
| **Database tables** | `agents`, `workflows`, `tools` | `agent_reasoning_traces`, `agent_memory` |
| **Responsibilities** | Configuration, scheduling, monitoring | LLM calls, tool execution, safety |
| **Complexity** | Standard CRUD operations | Complex reasoning loops |
| **Latency** | Low (< 100ms) | Variable (LLM-dependent) |

---

## 📊 Service Communication Matrix

### Control Plane Services
```python
ProjectService       → PostgreSQL
AgentService        → PostgreSQL
ToolService         → PostgreSQL
WorkflowService     → PostgreSQL
RunService          → PostgreSQL + APA (execution)
UserService         → PostgreSQL
```

### Execution Plane (APA) Services
```python
AgentExecutor       → All APA services
ReasoningEngine     → OpenAI/Anthropic APIs
ContextManager      → PostgreSQL + VectorStore
SafetyEngine        → PostgreSQL (HITL requests)
ToolRegistry        → External APIs/services
VectorStore         → ChromaDB/Pinecone
```

---

## 🎯 Responsibilities Breakdown

### What CONTROL PLANE Does:

1. **API Management**
   - Accept HTTP requests from Maestro
   - Validate requests
   - Authenticate users
   - Return responses

2. **Resource Management**
   - CRUD for projects, agents, tools, workflows
   - Version control
   - Access control
   - Metadata management

3. **Orchestration**
   - Trigger agent runs
   - Schedule workflows
   - Manage execution state
   - Handle cancellations

4. **Monitoring**
   - Collect metrics
   - Track execution history
   - Provide analytics
   - Health checks

---

### What EXECUTION PLANE (APA) Does:

1. **Intelligent Execution**
   - Run ReAct reasoning loops
   - Make LLM API calls
   - Parse LLM responses
   - Execute actions

2. **Memory Management**
   - Store agent memories
   - Generate embeddings
   - Semantic search
   - Context retrieval

3. **Safety & Compliance**
   - Classify action risks
   - Enforce policies
   - Trigger HITL approvals
   - Log violations

4. **Tool Execution**
   - Execute registered tools
   - Handle tool errors
   - Rate limiting
   - Result formatting

5. **Learning**
   - Store feedback
   - Track outcomes
   - Improve over time

---

## 🔗 Integration Points

### Where They Connect:

1. **Run Execution**
   ```
   Control Plane → APA
   POST /api/v1/runs/ → AgentExecutor.execute_task()
   ```

2. **HITL Approvals**
   ```
   APA → Control Plane → Maestro
   SafetyEngine.create_hitl_request() → Database → UI notification
   ```

3. **Agent Configuration**
   ```
   Control Plane → APA
   Agent config from database → Used by ReasoningEngine
   ```

4. **Memory Storage**
   ```
   APA → Database (shared)
   ContextManager → agent_memory table
   ```

5. **Metrics & Monitoring**
   ```
   APA → Control Plane
   Reasoning traces → workflow_steps table → Analytics API
   ```

---

## 📁 File Organization

### Control Plane Files:
```
backend/app/
├── api/v1/endpoints/
│   ├── auth.py
│   ├── projects.py
│   ├── agents.py
│   ├── tools.py
│   ├── workflows.py
│   └── runs.py
├── services/
│   ├── project_service.py
│   ├── agent_service.py
│   ├── tool_service.py
│   ├── workflow_service.py
│   ├── run_service.py
│   └── user_service.py
└── models/
    ├── project.py
    ├── agent.py
    ├── tool.py
    ├── workflow.py
    └── user.py
```

### Execution Plane (APA) Files:
```
backend/app/
├── api/v1/endpoints/
│   └── apa.py
├── services/apa/
│   ├── agent_executor.py
│   ├── reasoning_engine.py
│   ├── context_manager.py
│   ├── safety_engine.py
│   ├── tool_registry.py
│   └── vector_store.py
└── models/
    ├── agent_reasoning.py
    ├── agent_memory.py
    └── hitl.py
```

---

## 🎨 Visual Summary

```
┌─────────────────────────────────────────┐
│         MAESTRO (Frontend)              │
│      "What users see"                   │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│      CONTROL PLANE (API)                │
│      "What manages everything"          │
│                                         │
│  ✅ 30+ REST endpoints                  │
│  ✅ Full CRUD operations                │
│  ✅ Authentication & authorization      │
│  ✅ Orchestration & scheduling          │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│   EXECUTION PLANE (APA)                 │
│   "What makes agents intelligent"       │
│                                         │
│  ✅ LLM reasoning (GPT-4, Claude)       │
│  ✅ Semantic memory & search            │
│  ✅ Safety & HITL                       │
│  ✅ Tool execution                      │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│         DATABASE & STORAGE              │
│      "Where data lives"                 │
│                                         │
│  • PostgreSQL (12 tables)               │
│  • Vector DB (ChromaDB/Pinecone)        │
│  • Redis (optional)                     │
└─────────────────────────────────────────┘
```

---

**Both planes work together seamlessly to power the Spark-Ops Maestro platform!** 🚀
