# 🚀 Backend Setup Guide - Step by Step

## Complete implementation guide for Spark-Ops Control Plane (Python/FastAPI)

---

## 📋 Phase 1: Environment Setup (Day 1)

### Step 1: Navigate to Backend Directory

```bash
cd c:\Users\cogni\spark-ops\backend
```

### Step 2: Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Verify Python version
python --version  # Should be 3.11+
```

### Step 3: Install Dependencies

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install all requirements
pip install -r requirements.txt

# Verify installations
pip list
```

### Step 4: Configure Environment

```bash
# Copy environment template
copy .env.example .env

# Edit .env file with your PostgreSQL credentials
# Update these values:
# DATABASE_URL=postgresql+asyncpg://your_user:your_password@localhost:5432/sparkops
# SECRET_KEY=generate-a-secure-32-character-key-here
# API_KEY_SECRET=another-secure-key-here
```

**Generate secure keys:**
```python
# Run this in Python to generate secure keys
import secrets
print("SECRET_KEY:", secrets.token_urlsafe(32))
print("API_KEY_SECRET:", secrets.token_urlsafe(32))
```

---

## 📊 Phase 2: Database Setup (Day 1-2)

### Step 1: Verify PostgreSQL Connection

```bash
# Test connection
psql -h localhost -U your_username -d postgres

# Or using Python
python -c "import asyncpg; import asyncio; asyncio.run(asyncpg.connect('postgresql://user:pass@localhost:5432/postgres'))"
```

### Step 2: Create Database

```sql
-- Connect to PostgreSQL
CREATE DATABASE sparkops;

-- Create user if needed
CREATE USER sparkops_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sparkops TO sparkops_user;
```

### Step 3: Initialize Alembic

```bash
# Initialize Alembic
alembic init alembic

# This creates:
# - alembic/ directory
# - alembic.ini configuration file
```

### Step 4: Configure Alembic

Edit `alembic.ini`:
```ini
# Update the sqlalchemy.url line to:
sqlalchemy.url = postgresql+asyncpg://sparkops_user:your_password@localhost:5432/sparkops
```

Edit `alembic/env.py`:
```python
# Add at the top
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Import your models
from app.db.base import Base
from app.core.config import settings

# Update target_metadata
target_metadata = Base.metadata

# Update run_migrations_online function for async support
def run_migrations_online() -> None:
    """Run migrations in 'online' mode with async support."""
    configuration = context.config
    configuration.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
    
    connectable = async_engine_from_config(
        configuration.get_section(configuration.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async def do_run_migrations(connection: Connection) -> None:
        await connection.run_sync(do_migrations)

    def do_migrations(connection: Connection) -> None:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

    asyncio.run(connectable.connect().run_sync(do_run_migrations))
```

---

## 🏗️ Phase 3: Create Database Models (Day 2-3)

I'll continue creating the models in the next response. For now, let me create the first critical model - User:

### Create User Model

Create file: `app/models/user.py`

```python
"""
User model for authentication and authorization
"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
import enum

from app.db.base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    """User role enumeration"""
    OWNER = "owner"
    ADMIN = "admin"
    DEVELOPER = "developer"
    VIEWER = "viewer"


class User(Base, TimestampMixin):
    """User model for authentication"""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.VIEWER)
    api_key = Column(String(255), unique=True, nullable=True, index=True)
    api_key_hash = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    settings = Column(JSONB, default=dict, nullable=False)
    
    def __repr__(self) -> str:
        return f"<User(email={self.email}, role={self.role})>"
```

### Test Database Connection

Create file: `scripts/test_db.py`

```python
"""Test database connection"""
import asyncio
from app.db.session import engine
from app.db.base import Base


async def test_connection():
    """Test database connection"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database connection successful!")
        print("✅ Tables created successfully!")


if __name__ == "__main__":
    asyncio.run(test_connection())
```

Run the test:
```bash
python scripts/test_db.py
```

---

## 🔄 Phase 4: Create First Migration (Day 3)

### Step 1: Create Initial Migration

```bash
# Generate migration from models
alembic revision --autogenerate -m "Initial schema with users table"

# This creates a new file in alembic/versions/
```

### Step 2: Review Migration

Open the generated file in `alembic/versions/` and review the changes.

### Step 3: Apply Migration

```bash
# Apply migrations
alembic upgrade head

# Verify
alembic current
alembic history
```

### Step 4: Verify in PostgreSQL

```bash
psql -h localhost -U sparkops_user -d sparkops

# Run these commands
\dt                    # List all tables
\d users               # Describe users table
SELECT * FROM users;   # Query users
```

---

## 🚀 Phase 5: Start the Server (Day 3)

### Step 1: Run Development Server

```bash
# Make sure you're in backend/ and venv is activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Test Endpoints

Open your browser:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Root**: http://localhost:8000/

### Step 3: Test with curl

```bash
# Health check
curl http://localhost:8000/health

# Should return:
# {"status":"healthy","app":"Spark-Ops Control Plane","version":"v1"}
```

---

## 📝 Phase 6: Next Steps - Implementation Order

### Week 1: Authentication System
- [ ] Create User schemas (Pydantic)
- [ ] Implement registration endpoint
- [ ] Implement login endpoint
- [ ] Implement JWT token refresh
- [ ] Add authentication dependencies
- [ ] Test authentication flow

### Week 2: Core Models
- [ ] Create Project model
- [ ] Create Agent model
- [ ] Create Workflow model
- [ ] Create Tool model
- [ ] Create migrations
- [ ] Create Pydantic schemas

### Week 3: CRUD Operations
- [ ] Implement Projects CRUD
- [ ] Implement Agents CRUD
- [ ] Implement Workflows CRUD
- [ ] Implement Tools CRUD
- [ ] Add pagination
- [ ] Add filtering

### Week 4: Runs & Orchestration
- [ ] Create Run model
- [ ] Create RunStep model
- [ ] Implement run creation
- [ ] Set up Redis queues
- [ ] Create Celery workers
- [ ] Implement orchestration logic

### Week 5: Advanced Features
- [ ] Create Schedule model
- [ ] Implement scheduler service
- [ ] Create Policy model
- [ ] Implement policy engine
- [ ] Add budget tracking

### Week 6: Integration
- [ ] LangWatch integration
- [ ] Webhook support
- [ ] Monitoring setup
- [ ] Prometheus metrics
- [ ] Error tracking

---

## 🐛 Troubleshooting

### Issue: ModuleNotFoundError

```bash
# Solution: Ensure venv is activated
venv\Scripts\activate

# Reinstall requirements
pip install -r requirements.txt
```

### Issue: Database Connection Error

```bash
# Check PostgreSQL is running
# Check credentials in .env
# Test connection:
psql -h localhost -U your_user -d sparkops
```

### Issue: Alembic Migration Failed

```bash
# Reset database (CAUTION: Deletes all data)
alembic downgrade base
alembic upgrade head

# Or manually drop tables and recreate
```

### Issue: Import Errors

```bash
# Add app/ to PYTHONPATH
set PYTHONPATH=%PYTHONPATH%;C:\Users\cogni\spark-ops\backend

# Or run from backend/ directory
cd backend
python -m app.main
```

---

## 📚 Helpful Commands

```bash
# Virtual Environment
venv\Scripts\activate              # Activate venv
deactivate                         # Deactivate venv

# Server
uvicorn app.main:app --reload     # Start dev server
uvicorn app.main:app --workers 4  # Start with workers

# Database
alembic revision --autogenerate   # Create migration
alembic upgrade head               # Apply migrations
alembic downgrade -1               # Rollback one migration
alembic history                    # View history
alembic current                    # Current version

# Testing
pytest                             # Run all tests
pytest -v                          # Verbose
pytest --cov=app                   # With coverage

# Code Quality
black app/                         # Format code
isort app/                         # Sort imports
flake8 app/                        # Lint code
mypy app/                          # Type check

# Database Utilities
psql -h localhost -U user -d db   # Connect to PostgreSQL
\dt                               # List tables
\d table_name                     # Describe table
```

---

## 🎯 Success Criteria

✅ Virtual environment created and activated  
✅ All dependencies installed  
✅ Environment variables configured  
✅ Database connection successful  
✅ Alembic migrations working  
✅ User model created  
✅ Server running on http://localhost:8000  
✅ API documentation accessible  
✅ Health check endpoint working  

---

## 📞 Next Session Planning

**What we'll build next:**

1. **Authentication System** (2-3 hours)
   - User registration
   - Login with JWT
   - Token refresh
   - Protected routes

2. **Project Management** (2-3 hours)
   - Project CRUD
   - Project schemas
   - Authorization

3. **Agent Management** (3-4 hours)
   - Agent models
   - Agent CRUD
   - Health checking

**Take your time with each phase. No rush! 🚀**

Let me know when you're ready to proceed with the next phase!
