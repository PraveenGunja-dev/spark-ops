# Control Plane Implementation Guide

## Quick Start

### 1. Initialize Backend Project

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors helmet morgan
npm install @prisma/client dotenv
npm install redis ioredis bull
npm install jsonwebtoken bcryptjs
npm install zod express-validator
npm install winston

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/morgan @types/bcryptjs
npm install -D @types/jsonwebtoken
npm install -D prisma tsx nodemon
npm install -D @types/jest jest ts-jest supertest
```

### 2. Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── logger.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── rateLimit.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── agents.routes.ts
│   │   ├── workflows.routes.ts
│   │   ├── runs.routes.ts
│   │   ├── tools.routes.ts
│   │   ├── schedules.routes.ts
│   │   └── policies.routes.ts
│   ├── controllers/     # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── agents.controller.ts
│   │   ├── workflows.controller.ts
│   │   ├── runs.controller.ts
│   │   ├── tools.controller.ts
│   │   ├── schedules.controller.ts
│   │   └── policies.controller.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── project.service.ts
│   │   ├── agent.service.ts
│   │   ├── workflow.service.ts
│   │   ├── run.service.ts
│   │   ├── tool.service.ts
│   │   ├── schedule.service.ts
│   │   └── policy.service.ts
│   ├── models/          # Database models (if not using Prisma)
│   ├── types/           # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── project.types.ts
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── jwt.ts
│   │   ├── hash.ts
│   │   └── validators.ts
│   ├── workers/         # Background workers
│   │   ├── orchestrator.worker.ts
│   │   ├── scheduler.worker.ts
│   │   └── policy.worker.ts
│   ├── queues/          # Queue definitions
│   │   └── tasks.queue.ts
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Prisma schema
│   └── migrations/      # Database migrations
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

### 3. Initialize Prisma

```bash
# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env with DATABASE_URL
```

### 4. Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sparkops?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API Keys
API_KEY_SECRET=your-api-key-secret

# LangWatch
LANGWATCH_API_KEY=your-langwatch-api-key
LANGWATCH_ENDPOINT=https://api.langwatch.ai

# AWS (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_URL=http://localhost:3001
```

### 5. TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@config/*": ["./config/*"],
      "@middleware/*": ["./middleware/*"],
      "@routes/*": ["./routes/*"],
      "@controllers/*": ["./controllers/*"],
      "@services/*": ["./services/*"],
      "@types/*": ["./types/*"],
      "@utils/*": ["./utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 6. Package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

### 7. Database Setup with Docker

Create `docker-compose.yml` in backend directory:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sparkops-postgres
    environment:
      POSTGRES_USER: sparkops
      POSTGRES_PASSWORD: sparkops123
      POSTGRES_DB: sparkops
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sparkops"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sparkops-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

Start databases:
```bash
docker-compose up -d
```

### 8. Run Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Create initial migration
npm run prisma:migrate

# Open Prisma Studio (optional)
npm run prisma:studio
```

### 9. Start Development Server

```bash
npm run dev
```

Server will start on http://localhost:3000

### 10. Test API

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123","name":"Admin User"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

---

## Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/add-new-endpoint
   ```

2. **Write Code**
   - Add route in `routes/`
   - Add controller in `controllers/`
   - Add service in `services/`
   - Add types in `types/`

3. **Write Tests**
   ```bash
   npm run test:watch
   ```

4. **Run Linter**
   ```bash
   npm run lint
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new endpoint for X"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/add-new-endpoint
   ```

---

## Connecting Frontend to Backend

### Update Frontend .env

Create `.env.local` in frontend root:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Update API Client

The existing `src/lib/api-client.ts` already uses:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

Just update the environment variable and your frontend will connect!

---

## Next Implementation Steps

### Week 1: Foundation
- [ ] Set up project structure
- [ ] Configure Prisma with database schema
- [ ] Implement authentication (register, login, JWT)
- [ ] Create base API endpoints
- [ ] Set up error handling middleware
- [ ] Configure logging with Winston
- [ ] Write unit tests for auth

### Week 2: Core Services
- [ ] Implement Projects CRUD
- [ ] Implement Agents CRUD
- [ ] Implement Workflows CRUD
- [ ] Implement Tools CRUD
- [ ] Add validation middleware
- [ ] Add rate limiting
- [ ] Write integration tests

### Week 3: Orchestration
- [ ] Implement Runs creation
- [ ] Build orchestration engine
- [ ] Set up Redis queues
- [ ] Create worker service
- [ ] Add run execution logic
- [ ] Implement retry mechanism

### Week 4: Advanced Features
- [ ] Implement Scheduler service
- [ ] Build Policy engine
- [ ] Add Budget tracking
- [ ] Implement webhook support
- [ ] Add LangWatch integration
- [ ] Set up monitoring

---

## Useful Commands

```bash
# Database
npm run prisma:studio          # Open Prisma Studio
npm run prisma:migrate         # Run migrations
npx prisma migrate reset       # Reset database

# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Testing
npm run test                   # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report

# Docker
docker-compose up -d           # Start services
docker-compose down            # Stop services
docker-compose logs -f         # View logs
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Database Connection Error
- Check Docker containers are running: `docker ps`
- Check DATABASE_URL in .env
- Test connection: `npx prisma db pull`

### Redis Connection Error
- Check Redis is running: `docker ps`
- Test connection: `redis-cli ping`

---

**Ready to build!** 🚀
