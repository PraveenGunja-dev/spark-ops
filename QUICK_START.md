# 🚀 Multi-Framework Execution Plane - Quick Start

## What Was Built?

A **complete multi-framework execution system** that allows developers to:
1. Build workflows visually using React Flow
2. Get AI-powered framework recommendations
3. Execute workflows using LangChain, CrewAI, LangGraph, or Custom implementations

## ⚡ Quick Install

If you haven't already installed the new framework dependencies:

```bash
cd backend
.\venv\Scripts\python.exe -m pip install langgraph langsmith crewai llama-index --upgrade
```

## 🎯 Quick Test

### 1. Start Backend (if not running)
```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### 2. Test API Endpoints
Visit http://localhost:8000/docs and try:

**List Available Frameworks:**
```
GET /api/v1/workflows/frameworks
```

**Analyze a Workflow:**
```
POST /api/v1/workflows/analyze

Body:
{
  "nodes": [
    {"id": "1", "type": "agent", "data": {"label": "Agent 1"}},
    {"id": "2", "type": "agent", "data": {"label": "Agent 2"}}
  ],
  "edges": [
    {"source": "1", "target": "2"}
  ]
}
```

Expected response will suggest "crewai" for this multi-agent workflow.

**Execute a Workflow:**
```
POST /api/v1/workflows/execute

Body:
{
  "framework": "langchain",
  "nodes": [
    {
      "id": "agent-1",
      "type": "agent",
      "data": {
        "label": "Research Agent",
        "provider": "openai",
        "model": "gpt-4",
        "system_prompt": "You are a helpful research assistant.",
        "tools": []
      }
    }
  ],
  "edges": [],
  "input": {
    "input": "What is AI?"
  }
}
```

## 🎨 Using the UI

### Option 1: Enhanced Workflow Builder
Use the new EnhancedWorkflowBuilder component that includes framework selection:

```tsx
import { EnhancedWorkflowBuilder } from '@/components/workflow/EnhancedWorkflowBuilder';

function MyPage() {
  return <EnhancedWorkflowBuilder />;
}
```

### Option 2: Standalone Components
Use individual components:

```tsx
import { FrameworkSelector } from '@/components/workflow/FrameworkSelector';
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder';

function MyPage() {
  const [framework, setFramework] = useState('langchain');
  
  return (
    <>
      <FrameworkSelector
        selectedFramework={framework}
        onSelect={setFramework}
      />
      <WorkflowBuilder />
    </>
  );
}
```

## 📊 Framework Selection Guide

The system automatically recommends frameworks based on:

| Workflow Type | Recommended Framework | Reason |
|--------------|----------------------|---------|
| 1 agent | LangChain | Optimized for single-agent ReAct |
| 2+ agents | CrewAI | Built for multi-agent collaboration |
| Has conditions + parallel | LangGraph | State machine handles complexity |
| Has conditions only | LangGraph | Excellent conditional routing |
| Simple workflow | Custom | Lightweight, no overhead |

## 🔧 Troubleshooting

### Import Errors
If you get import errors, make sure you've installed dependencies:
```bash
pip install langgraph langsmith crewai llama-index
```

### Framework Not Found
Check that the framework name is lowercase:
- ✅ "langchain"
- ✅ "crewai"  
- ✅ "langgraph"
- ✅ "custom"
- ❌ "LangChain"

### Execution Fails
Ensure you have valid API keys in `.env`:
```env
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
```

## 📚 Documentation

- **MULTI_FRAMEWORK_IMPLEMENTATION.md** - Complete technical documentation
- **IMPLEMENTATION_SUMMARY.md** - Quick overview and statistics
- **QUICK_START.md** - This file

## 🎯 What to Try

### Example 1: Single-Agent Research
```json
{
  "framework": "langchain",
  "nodes": [{"id": "1", "type": "agent", "data": {...}}],
  "edges": [],
  "input": {"input": "Research topic X"}
}
```

### Example 2: Multi-Agent Pipeline
```json
{
  "framework": "crewai",
  "nodes": [
    {"id": "researcher", "type": "agent", "data": {"label": "Researcher"}},
    {"id": "writer", "type": "agent", "data": {"label": "Writer"}}
  ],
  "edges": [
    {"source": "researcher", "target": "writer"}
  ],
  "input": {"input": "Write an article about AI"}
}
```

### Example 3: Conditional Workflow
```json
{
  "framework": "langgraph",
  "nodes": [
    {"id": "1", "type": "agent", "data": {...}},
    {"id": "2", "type": "decision", "data": {...}},
    {"id": "3", "type": "agent", "data": {...}},
    {"id": "4", "type": "agent", "data": {...}}
  ],
  "edges": [
    {"source": "1", "target": "2"},
    {"source": "2", "target": "3", "data": {"condition": "true"}},
    {"source": "2", "target": "4", "data": {"condition": "false"}}
  ]
}
```

## ✅ Verification

Run the verification script:
```bash
python verify_implementation.py
```

Or manually check:
- [ ] Backend running without errors
- [ ] Visit http://localhost:8000/docs
- [ ] See "Workflow Execution" tag in API docs
- [ ] Test `/workflows/frameworks` endpoint
- [ ] Test `/workflows/analyze` endpoint

## 🎉 Success!

If you can see the Workflow Execution endpoints in Swagger and call them successfully, everything is working!

Next steps:
1. Build some test workflows in the UI
2. Try different frameworks
3. Compare execution times and costs
4. Extend with custom tools

---

**Happy Building! 🚀**
