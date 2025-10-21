# 🎛️ Spark-Ops Control Plane

**Python/FastAPI Backend for Agentic AI Orchestration Platform**

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Git

### Installation

```bash
# Clone repository (if not already)
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
```

### Database Setup

```bash
# Initialize Alembic
alembic init alembic

# Create first migration
alembic revision --autogenerate -m "Initial schema"

# Run migrations
alembic upgrade head
```

### Run Development Server

```bash
# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Server will be available at:
# - API: http://localhost:8000
# - Docs: http://localhost:8000/docs
# - ReDoc: http://localhost:8000/redoc
```

### Run Workers

```bash
# In a separate terminal, start Celery worker
celery -A app.workers.celery_app worker --loglevel=info

# Start Celery beat (scheduler)
celery -A app.workers.celery_app beat --loglevel=info

# Start Flower (Celery monitoring)
celery -A app.workers.celery_app flower --port=5555
```

---

## 📁 Project Structure

```
backend/
├── alembic/                    # Database migrations
│   ├── versions/              # Migration files
│   └── env.py                 # Alembic config
├── app/
│   ├── api/                   # API routes
│   │   ├── v1/               # API version 1
│   │   │   ├── endpoints/    # Route handlers
│   │   │   │   ├── auth.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── agents.py
│   │   │   │   ├── workflows.py
│   │   │   │   ├── runs.py
│   │   │   │   ├── tools.py
│   │   │   │   ├── schedules.py
│   │   │   │   ├── policies.py
│   │   │   │   └── metrics.py
│   │   │   └── router.py     # API router
│   │   └── deps.py           # Dependencies
│   ├── core/                  # Core configuration
│   │   ├── config.py         # Settings
│   │   ├── security.py       # Auth utilities
│   │   └── logging.py        # Logging setup
│   ├── db/                    # Database
│   │   ├── base.py           # Base model
│   │   ├── session.py        # DB session
│   │   └── init_db.py        # DB initialization
│   ├── models/                # SQLAlchemy models
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── agent.py
│   │   ├── workflow.py
│   │   ├── run.py
│   │   ├── tool.py
│   │   ├── schedule.py
│   │   ├── policy.py
│   │   └── budget.py
│   ├── schemas/               # Pydantic schemas
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── agent.py
│   │   ├── workflow.py
│   │   ├── run.py
│   │   ├── tool.py
│   │   ├── schedule.py
│   │   ├── policy.py
│   │   └── common.py
│   ├── services/              # Business logic
│   │   ├── auth_service.py
│   │   ├── project_service.py
│   │   ├── agent_service.py
│   │   ├── workflow_service.py
│   │   ├── run_service.py
│   │   ├── orchestration_service.py
│   │   ├── policy_service.py
│   │   └── langwatch_service.py
│   ├── workers/               # Background tasks
│   │   ├── celery_app.py     # Celery setup
│   │   ├── orchestrator.py   # Workflow orchestration
│   │   ├── scheduler.py      # Cron scheduler
│   │   └── policy_checker.py # Policy enforcement
│   ├── utils/                 # Utilities
│   │   ├── pagination.py
│   │   ├── validators.py
│   │   └── helpers.py
│   ├── middleware/            # Custom middleware
│   │   ├── cors.py
│   │   ├── rate_limit.py
│   │   └── logging.py
│   └── main.py               # FastAPI app
├── tests/                     # Tests
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── scripts/                   # Utility scripts
│   ├── create_superuser.py
│   └── seed_data.py
├── .env.example              # Environment template
├── .gitignore
├── requirements.txt          # Dependencies
├── pyproject.toml           # Python project config
└── README.md
```

---

## 🔧 Development

### Code Quality

```bash
# Format code
black app/

# Sort imports
isort app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_auth.py

# Run in watch mode
pytest-watch
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history

# View current version
alembic current
```

---

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Key Endpoints

#### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

#### Projects
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{id}
PATCH  /api/v1/projects/{id}
DELETE /api/v1/projects/{id}
```

#### Agents
```
GET    /api/v1/agents
POST   /api/v1/agents
GET    /api/v1/agents/{id}
PATCH  /api/v1/agents/{id}
DELETE /api/v1/agents/{id}
```

#### Workflows
```
GET    /api/v1/workflows
POST   /api/v1/workflows
GET    /api/v1/workflows/{id}
PATCH  /api/v1/workflows/{id}
DELETE /api/v1/workflows/{id}
```

#### Runs
```
GET    /api/v1/runs
POST   /api/v1/runs
GET    /api/v1/runs/{id}
PATCH  /api/v1/runs/{id}/cancel
POST   /api/v1/runs/{id}/retry
GET    /api/v1/runs/{id}/steps
```

---

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- API key support for programmatic access
- CORS configuration
- Rate limiting
- Input validation with Pydantic

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -h localhost -U sparkops -d sparkops

# Test connection in Python
python -c "from app.db.session import engine; print(engine.connect())"
```

### Redis Connection Error
```bash
# Test Redis connection
redis-cli ping

# Check Redis in Python
python -c "import redis; r=redis.Redis(); print(r.ping())"
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Clear pycache
find . -type d -name __pycache__ -exec rm -r {} +
```

---

## 📦 Deployment

### Docker Deployment

```bash
# Build image
docker build -t sparkops-control-plane .

# Run container
docker run -d \
  --name sparkops-api \
  -p 8000:8000 \
  --env-file .env \
  sparkops-control-plane
```

### Production Checklist

- [ ] Set strong SECRET_KEY
- [ ] Configure production database
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure monitoring
- [ ] Set up backup strategy
- [ ] Review CORS settings
- [ ] Enable rate limiting
- [ ] Configure auto-scaling
- [ ] Set up health checks

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Format code
5. Submit PR

---

## 📝 License

MIT License - See LICENSE file

---

**Built with ❤️ using FastAPI**
