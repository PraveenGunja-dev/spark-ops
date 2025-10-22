# Spark-Ops Maestro - Agentic Process Automation Platform

## 🚀 Overview

**Spark-Ops Maestro** is a next-generation AI agent platform powered by **Agentic Process Automation (APA)** as its execution layer. Maestro provides the interface and orchestration, while APA serves as the intelligent runtime engine that enables autonomous agents to **think, reason, learn, and act** independently—transforming rigid, rule-based workflows into adaptive, intelligent processes.

## 🧠 What is APA?

**Agentic Process Automation (APA)** is the execution layer that powers Maestro. APA represents the evolution beyond traditional RPA (Robotic Process Automation)—while RPA follows predetermined scripts, APA provides an intelligent runtime where agents:

- **Reason** using the ReAct pattern (Reasoning + Acting)
- **Remember** past experiences with semantic memory
- **Learn** from outcomes and improve over time
- **Collaborate** with other agents and humans
- **Adapt** to unexpected situations dynamically

Think of **Maestro** as the cockpit where you manage and monitor agents, and **APA** as the engine that runs them.

## ✨ Key Features

### 🤖 ReAct Reasoning
Agents think step-by-step, analyzing situations and making intelligent decisions
- LLM-powered reasoning (OpenAI GPT-4, Anthropic Claude)
- Thought → Action → Observation → Reflection loop
- Complete trace visibility for every decision

### 🧬 Semantic Memory
Vector-based memory enables agents to learn and recall from past experiences
- ChromaDB/Pinecone vector storage
- OpenAI embeddings for semantic search
- Contextual memory retrieval

### 🛡️ Human-in-the-Loop (HITL)
Safety controls with approval workflows for high-risk actions
- Risk-based action classification
- Real-time approval dashboard
- Audit trail for all decisions

### 👁️ Full Observability
Real-time trace visualization and performance monitoring
- Step-by-step reasoning traces
- Token usage and latency tracking
- Multi-agent collaboration logs

### 🤝 Multi-Agent Orchestration
Coordinate teams of specialized agents
- Agent collaboration protocols
- Shared context management
- Hierarchical agent structures

## 🏗️ Architecture

### Three-Layer Design

**1. Platform Layer (Maestro)**
- User interface and dashboards
- Agent management and configuration
- Workflow orchestration
- Observability and analytics
- Human-in-the-Loop (HITL) controls

**2. Execution Layer (APA)**
- **ReAct Reasoning Engine** - LLM-powered decision making
- **Context Manager** - Semantic memory retrieval
- **Tool Registry** - Extensible tool ecosystem
- **Safety Engine** - Guardrails and compliance
- **Agent Executor** - Core runtime engine

**3. Infrastructure**
- Database (PostgreSQL + pgvector)
- Vector stores (ChromaDB/Pinecone)
- LLM providers (OpenAI/Anthropic)

## 🏗️ Technology Stack

### Frontend
- **React** + TypeScript + Vite
- **shadcn-ui** component library
- **Tailwind CSS** for styling
- **React Query** for state management

### Backend
- **FastAPI** (Python 3.11+)
- **PostgreSQL** with pgvector extension
- **SQLAlchemy** ORM
- **Alembic** for migrations

### AI/ML
- **OpenAI GPT-4** / **Anthropic Claude** - LLM reasoning
- **ChromaDB** / **Pinecone** - Vector database
- **LangChain** - Agent framework
- **OpenAI Embeddings** - Semantic search

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- PostgreSQL 13+
- OpenAI API key (for LLM reasoning)

### Frontend Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

### Backend Setup

```sh
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run database migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`

## 📋 Environment Configuration

### Required Variables

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/sparkops

# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Vector Database
VECTOR_STORE_TYPE=chromadb
CHROMADB_PATH=./data/chromadb

# APA Configuration
MAX_REASONING_ITERATIONS=10
DEFAULT_EMBEDDING_MODEL=text-embedding-3-small
ENABLE_AGENT_LEARNING=True
ENABLE_HITL=True
```

## 📚 Documentation

- **[Quick Reference](./QUICK_REFERENCE.md)** - Cheat sheet for developers (routes, APIs, commands)
- **[Maestro + APA Relationship](./MAESTRO_APA_RELATIONSHIP.md)** - Understanding the two-layer architecture
- **[Architecture Guide](./ARCHITECTURE.md)** - Complete system architecture (Maestro + APA layers)
- [APA Architecture](./APA_ARCHITECTURE.md) - APA execution layer design
- [APA Conversion Roadmap](./APA_CONVERSION_ROADMAP.md) - 16-week implementation plan
- [Implementation Complete](./APA_IMPLEMENTATION_COMPLETE.md) - Full stack overview
- [Migration Guide](./MIGRATION_TO_APA_ONLY.md) - Platform evolution

## 🎯 Platform Navigation

### Main Routes
- `/maestro` - Dashboard (agent overview, metrics)
- `/maestro/agents` - AI agent management
- `/maestro/agents/:id` - Agent details with reasoning traces
- `/maestro/workflows` - Autonomous workflows
- `/maestro/observability` - Real-time monitoring
- `/maestro/hitl` - Human-in-the-Loop dashboard
- `/maestro/governance` - Safety policies & controls
- `/maestro/integrations` - Tool connections
- `/maestro/settings` - Platform configuration

## 🧪 Testing

```sh
# Frontend tests
npm run test

# Backend tests
cd backend
pytest

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Frontend
Deploy to Vercel, Netlify, or any static hosting:

```sh
npm run build
# Deploy dist/ folder
```

### Backend
Deploy with Docker:

```sh
cd backend
docker build -t spark-ops-backend .
docker run -p 8000:8000 spark-ops-backend
```

## 🤝 Contributing

This project represents the cutting edge of agentic automation. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📜 License

MIT License - See LICENSE file for details

## 🌟 What Makes This Special?

Spark-Ops Maestro isn't just another automation platform—it's a **paradigm shift**:

- **Traditional RPA**: "Execute step A, then B, then C"
- **Spark-Ops Maestro + APA**: "Achieve goal X" (agent figures out the steps)

Maestro provides the control center, while APA powers the intelligent execution. Our agents don't just follow instructions—they **understand**, **reason**, and **learn**.

## 🔗 Links

**URL**: https://lovable.dev/projects/e89230a8-1f50-40e0-8c60-29e263b18670

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e89230a8-1f50-40e0-8c60-29e263b18670) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e89230a8-1f50-40e0-8c60-29e263b18670) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
