# UI Integration Architecture

**Visual guide to Control Plane + APA integration with Maestro UI**

---

## 🏗️ Three-Layer Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                       MAESTRO UI (Frontend)                          │
│                     React + TypeScript + Vite                        │
│                       Port: 5173 (dev)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                        Pages Layer                              │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  AgentDetails.tsx      │  HITLDashboard.tsx                    │ │
│  │  - Shows agent info    │  - HITL approval queue                │ │
│  │  - Reasoning traces    │  - Approve/reject actions             │ │
│  │  - Agent memory        │  - Risk level filtering               │ │
│  │  - Execute tasks       │  - Statistics dashboard               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                             ↓ uses                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    React Query Hooks                            │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  Control Plane Hooks:          │  APA Hooks (NEW!):            │ │
│  │  ────────────────────           │  ──────────────               │ │
│  │  • useAgents()                  │  • useAgentReason()          │ │
│  │  • useProjects()                │  • useReasoningTraces()      │ │
│  │  • useTools()                   │  • useAgentMemory()          │ │
│  │  • useWorkflows()               │  • useSearchMemory()         │ │
│  │  • useRuns()                    │  • usePendingHITL()          │ │
│  │  • useAuth()                    │  • useApproveHITL()          │ │
│  │                                 │  • useRejectHITL()           │ │
│  │                                 │  • useAgentLearn()           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                             ↓ uses                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      API Client Layer                           │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  api-client.ts                                                  │ │
│  │  • apiGet(), apiPost(), apiPut(), apiDelete()                  │ │
│  │  • JWT authentication                                           │ │
│  │  • Error handling                                               │ │
│  │  • Timeout management (30s)                                     │ │
│  │  • Base URL: http://localhost:8000/api/v1                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓ HTTP/REST
                       (CORS enabled on backend)
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND APIs                                  │
│                    FastAPI + Python 3.11+                            │
│                       Port: 8000                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                   Control Plane APIs                            │ │
│  │                   /api/v1/*                                     │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  /auth/*          │  /projects/*     │  /agents/*              │ │
│  │  /tools/*         │  /workflows/*    │  /runs/*                │ │
│  │                                                                 │ │
│  │  Status: ✅ OPERATIONAL                                         │ │
│  │  Integration: ✅ COMPLETE                                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │               Execution Plane (APA) APIs                        │ │
│  │                   /api/apa/*                                    │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  /apa/agents/{id}/reason                                       │ │
│  │  /apa/agents/{id}/reasoning-trace                              │ │
│  │  /apa/agents/{id}/memory                                       │ │
│  │  /apa/memory/search                                            │ │
│  │  /apa/hitl/pending                                             │ │
│  │  /apa/hitl/{id}/approve                                        │ │
│  │  /apa/hitl/{id}/reject                                         │ │
│  │  /apa/tools                                                    │ │
│  │                                                                 │ │
│  │  Status: ✅ OPERATIONAL                                         │ │
│  │  Integration: ⚠️ PARTIAL (hooks created, components need update)│ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  PostgreSQL + pgvector  │  ChromaDB/Pinecone                        │
│  (Relational + Vector)  │  (Vector Embeddings)                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Example 1: Viewing Agent Reasoning Traces

```
┌──────────────┐
│   USER       │  Navigates to /maestro/agents/123
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────┐
│  AgentDetails.tsx                    │
│  • useReasoningTraces('123')         │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  React Query                         │
│  • Check cache                       │
│  • If stale, fetch from API          │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  api-client.ts                       │
│  apiGet('/apa/agents/123/           │
│         reasoning-trace')            │
└──────┬───────────────────────────────┘
       │
       ↓ HTTP GET
┌──────────────────────────────────────┐
│  Backend: /api/apa/agents/123/       │
│           reasoning-trace            │
│                                      │
│  APA Service: reasoning_engine.py    │
│  • Query agent_reasoning_traces      │
│  • Return traces with metadata       │
└──────┬───────────────────────────────┘
       │
       ↓ JSON Response
┌──────────────────────────────────────┐
│  {                                   │
│    "agent_id": "123",                │
│    "traces": [                       │
│      {                               │
│        "thought": "...",             │
│        "action": {...},              │
│        "observation": {...}          │
│      }                               │
│    ]                                 │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  React Query                         │
│  • Cache response                    │
│  • Update component state            │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  ReasoningTraceViewer.tsx            │
│  • Render traces                     │
│  • Show thought → action → result    │
│  • Display tokens & latency          │
└──────────────────────────────────────┘
```

---

### Example 2: Approving HITL Request

```
┌──────────────┐
│   USER       │  Clicks "Approve" on HITL request
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────┐
│  HITLDashboard.tsx                   │
│  • useApproveHITL()                  │
│  • mutate({ requestId, feedback })   │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  React Query Mutation                │
│  • Optimistic update (optional)      │
│  • Call API                          │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  api-client.ts                       │
│  apiPost('/apa/hitl/123/approve',   │
│          { feedback: "..." })        │
└──────┬───────────────────────────────┘
       │
       ↓ HTTP POST
┌──────────────────────────────────────┐
│  Backend: /api/apa/hitl/123/approve  │
│                                      │
│  APA Service: safety_engine.py       │
│  • Update hitl_requests table        │
│  • Set status = 'approved'           │
│  • Store feedback                    │
│  • Resume agent execution            │
└──────┬───────────────────────────────┘
       │
       ↓ JSON Response
┌──────────────────────────────────────┐
│  {                                   │
│    "status": "success",              │
│    "request_id": "123"               │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  React Query                         │
│  • Invalidate pending HITL cache     │
│  • Refetch pending requests          │
│  • Show success toast                │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  HITLDashboard.tsx                   │
│  • Request removed from pending      │
│  • Moved to approved tab             │
│  • Agent execution resumed           │
└──────────────────────────────────────┘
```

---

### Example 3: Executing Agent Task

```
┌──────────────┐
│   USER       │  Clicks "Execute Task"
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────┐
│  AgentDetails.tsx                    │
│  • useAgentReason('123')             │
│  • mutate({                          │
│      description: "Analyze tickets", │
│      parameters: {}                  │
│    })                                │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  api-client.ts                       │
│  apiPost('/apa/agents/123/reason',  │
│          { description, params })    │
└──────┬───────────────────────────────┘
       │
       ↓ HTTP POST
┌──────────────────────────────────────┐
│  Backend: /api/apa/agents/123/reason │
│                                      │
│  APA Services:                       │
│  1. agent_executor.py                │
│     • Initialize execution           │
│     • Start ReAct loop               │
│                                      │
│  2. reasoning_engine.py              │
│     • Call OpenAI/Anthropic          │
│     • Get thought + action           │
│                                      │
│  3. safety_engine.py                 │
│     • Check action risk              │
│     • Create HITL if needed          │
│                                      │
│  4. tool_registry.py                 │
│     • Execute action/tool            │
│                                      │
│  5. context_manager.py               │
│     • Store memory                   │
│     • Retrieve context               │
│                                      │
│  6. Loop until complete              │
└──────┬───────────────────────────────┘
       │
       ↓ JSON Response
┌──────────────────────────────────────┐
│  {                                   │
│    "agent_id": "123",                │
│    "execution_id": "run-456",        │
│    "result": {                       │
│      "status": "completed",          │
│      "iterations": 5,                │
│      "actions_taken": 5              │
│    }                                 │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  React Query                         │
│  • Cache result                      │
│  • Invalidate reasoning traces       │
│  • Trigger refetch of traces         │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  AgentDetails.tsx                    │
│  • Show success message              │
│  • Reasoning tab updated with        │
│    new traces                        │
│  • Memory tab may show new entries   │
└──────────────────────────────────────┘
```

---

## 🔌 API Endpoint Mapping

| Frontend Hook | Backend Endpoint | Backend Service | Database Table |
|---------------|-----------------|-----------------|----------------|
| `useAgents()` | `GET /api/v1/agents` | `agent_service.py` | `agents` |
| `useAgent(id)` | `GET /api/v1/agents/{id}` | `agent_service.py` | `agents` |
| `useAgentReason(id)` | `POST /api/apa/agents/{id}/reason` | `agent_executor.py` | `workflow_executions` |
| `useReasoningTraces(id)` | `GET /api/apa/agents/{id}/reasoning-trace` | `reasoning_engine.py` | `agent_reasoning_traces` |
| `useAgentMemory(id)` | `GET /api/apa/agents/{id}/memory` | `context_manager.py` | `agent_memory` |
| `useSearchMemory(id)` | `POST /api/apa/memory/search` | `vector_store.py` | `agent_memory` + ChromaDB |
| `usePendingHITL()` | `GET /api/apa/hitl/pending` | `safety_engine.py` | `hitl_requests` |
| `useApproveHITL()` | `POST /api/apa/hitl/{id}/approve` | `safety_engine.py` | `hitl_requests` |
| `useRejectHITL()` | `POST /api/apa/hitl/{id}/reject` | `safety_engine.py` | `hitl_requests` |

---

## 🎨 Component Integration Status

```
┌─────────────────────────────────────────────────────────────┐
│                    Maestro Pages                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Login                   ✅ Dashboard                     │
│  ✅ Register                ✅ Agents List                   │
│  ⚠️ AgentDetails            ✅ Workflows                     │
│  ⚠️ HITLDashboard           ✅ Tools                         │
│  ✅ Observability           ✅ Settings                      │
│                                                              │
│  Legend:                                                     │
│  ✅ = Fully integrated with real APIs                       │
│  ⚠️ = Using mock data, needs APA hook integration          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Hierarchy

```
App.tsx
│
├─ MaestroLayout
│  │
│  ├─ MaestroSidebar (navigation)
│  │
│  └─ Routes
│     │
│     ├─ /maestro/agents/:id (AgentDetails)
│     │  │
│     │  ├─ Tabs
│     │  │  ├─ Overview Tab
│     │  │  │  └─ Agent config cards
│     │  │  │
│     │  │  ├─ Reasoning Tab
│     │  │  │  └─ ReasoningTraceViewer ⚠️
│     │  │  │     (needs: useReasoningTraces)
│     │  │  │
│     │  │  └─ Memory Tab
│     │  │     └─ AgentMemoryViewer ⚠️
│     │  │        (needs: useAgentMemory)
│     │  │
│     │  └─ Execute Task Button
│     │     (needs: useAgentReason)
│     │
│     └─ /maestro/hitl (HITLDashboard)
│        │
│        ├─ Stats Cards ⚠️
│        │
│        ├─ Tabs (Pending/Approved/Rejected)
│        │  └─ HITLApprovalCard ⚠️
│        │     (needs: useApproveHITL, useRejectHITL)
│        │
│        └─ Auto-refresh
│           (needs: usePendingHITL with refetchInterval)
```

---

## 🚀 Integration Priority

### **Phase 1: Critical** (Immediate)
1. ✅ Create APA hooks - **DONE**
2. ⏳ Update AgentDetails.tsx - **NEXT**
   - Replace mock reasoning traces
   - Replace mock memories
   - Wire up execute button
3. ⏳ Update HITLDashboard.tsx - **NEXT**
   - Replace mock requests
   - Wire up approve/reject

### **Phase 2: Important** (Soon)
4. ⏳ Add loading states
5. ⏳ Add error handling UI
6. ⏳ Add retry mechanisms
7. ⏳ Add optimistic updates

### **Phase 3: Enhancement** (Later)
8. ⏳ WebSocket for real-time HITL
9. ⏳ Infinite scroll for traces
10. ⏳ Advanced filtering
11. ⏳ Export functionality

---

## 🎯 Success Metrics

### **Integration Complete When**:
- [ ] No mock data in components
- [ ] All APA features functional
- [ ] Real-time data flowing
- [ ] Error handling working
- [ ] Loading states implemented
- [ ] End-to-end tests passing

### **User Experience Goals**:
- Agent reasoning executes in < 3s
- Reasoning traces load in < 1s
- HITL approvals processed in < 500ms
- Memory search returns in < 2s
- UI feels responsive and smooth

---

**Integration Architecture Complete** ✅
