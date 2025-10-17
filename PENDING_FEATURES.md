# 📋 Spark-Ops Control Plane - Pending Features

**Last Updated**: October 16, 2025  
**Current Status**: Core Integration Complete ✅

---

## ✅ What's Complete

### Backend APIs
- ✅ Authentication (Login, Register, JWT)
- ✅ Projects API (CRUD)
- ✅ Agents API (CRUD + Health monitoring)
- ✅ Workflows API (CRUD + Version tracking)
- ✅ Tools API (CRUD + Tool registry)
- ✅ Runs API (List + Filters)

### Frontend Integration
- ✅ Global project selection (ProjectContext)
- ✅ React Query hooks (useProjects, useAgents, useWorkflows, useRuns)
- ✅ Create dialogs (Agents, Workflows)
- ✅ All pages integrated with real API data
- ✅ Loading and empty states
- ✅ Toast notifications
- ✅ Proper routing and navigation

---

## 🚧 Pending Backend Features

### 1. **Runs Management** (HIGH PRIORITY)

#### Missing Endpoints:
```python
POST   /runs                    # Create/start new run
GET    /runs/{id}               # Get run details
POST   /runs/{id}/cancel        # Cancel running run
POST   /runs/{id}/retry         # Retry failed run
GET    /runs/{id}/steps         # Get run step details
GET    /runs/{id}/logs          # Get run execution logs
```

**Implementation Needed**:
- `backend/app/api/v1/endpoints/runs.py` - Add missing endpoints
- `backend/app/services/run_service.py` - Business logic for run execution
- `backend/app/models/run_step.py` - Step tracking model (if not exists)

---

### 2. **Tools Integration** (MEDIUM PRIORITY)

#### Missing Endpoints:
```python
POST   /tools                   # Create new tool
PUT    /tools/{id}              # Update tool
DELETE /tools/{id}              # Delete tool
POST   /tools/{id}/test         # Test tool execution
GET    /tools/{id}/usage        # Get tool usage stats
```

**Implementation Needed**:
- Tool testing/validation service
- Usage tracking and analytics
- Rate limiting enforcement

---

### 3. **Agent Management** (MEDIUM PRIORITY)

#### Missing Endpoints:
```python
PUT    /agents/{id}             # Update agent configuration
DELETE /agents/{id}             # Delete agent
POST   /agents/{id}/deploy      # Deploy agent to environment
POST   /agents/{id}/scale       # Scale agent instances
GET    /agents/{id}/metrics     # Detailed metrics
GET    /agents/{id}/runs        # Runs for this agent
```

**Implementation Needed**:
- Agent deployment service
- Auto-scaling logic
- Metrics aggregation

---

### 4. **Workflow Management** (MEDIUM PRIORITY)

#### Missing Endpoints:
```python
PUT    /workflows/{id}          # Update workflow
DELETE /workflows/{id}          # Delete workflow
POST   /workflows/{id}/publish  # Publish draft → released
POST   /workflows/{id}/test     # Test workflow execution
GET    /workflows/{id}/runs     # Runs for this workflow
GET    /workflows/{id}/analytics # Workflow analytics
```

**Implementation Needed**:
- Workflow testing service
- Publishing workflow (draft → released)
- Analytics aggregation

---

### 5. **Approvals System** (LOW PRIORITY)

#### New Endpoints Needed:
```python
GET    /approvals               # List pending approvals
POST   /approvals/{id}/approve  # Approve a step/run
POST   /approvals/{id}/reject   # Reject a step/run
GET    /approvals/stats         # Approval statistics
```

**Implementation Needed**:
- `backend/app/models/approval.py` - Approval model
- `backend/app/api/v1/endpoints/approvals.py` - Approvals endpoints
- `backend/app/services/approval_service.py` - Approval logic
- Webhook/notification system for pending approvals

---

### 6. **Analytics & Reporting** (MEDIUM PRIORITY)

#### New Endpoints Needed:
```python
GET    /analytics/overview      # Dashboard KPIs
GET    /analytics/runs          # Run statistics
GET    /analytics/costs         # Cost breakdown
GET    /analytics/agents        # Agent performance
GET    /analytics/workflows     # Workflow analytics
```

**Implementation Needed**:
- Analytics aggregation service
- Time-series data queries
- Cost calculation service
- Export to CSV/Excel

---

### 7. **Policies & Governance** (LOW PRIORITY)

#### New Endpoints Needed:
```python
GET    /policies                # List policies
POST   /policies                # Create policy
PUT    /policies/{id}           # Update policy
DELETE /policies/{id}           # Delete policy
GET    /policies/{id}/violations # Policy violations
```

**Implementation Needed**:
- `backend/app/models/policy.py` - Policy model
- `backend/app/api/v1/endpoints/policies.py` - Policies endpoints
- Policy evaluation engine
- Violation tracking

---

### 8. **Real-time Updates** (HIGH PRIORITY)

#### WebSocket Implementation:
```python
WebSocket /ws/runs/{id}         # Real-time run updates
WebSocket /ws/agents/{id}       # Real-time agent health
WebSocket /ws/activity          # Activity feed updates
```

**Implementation Needed**:
- FastAPI WebSocket endpoints
- Redis pub/sub for broadcasting
- Frontend WebSocket client

---

## 🎨 Pending Frontend Features

### 1. **Tools Page Integration** (HIGH PRIORITY)

**Current Status**: Uses mock data  
**File**: `src/pages/Tools.tsx`

**Tasks**:
- [ ] Create `useTools` React Query hook
- [ ] Update Tools.tsx to use real API
- [ ] Create `CreateToolDialog` component
- [ ] Add tool testing functionality
- [ ] Add tool usage statistics

---

### 2. **Run Details Page** (HIGH PRIORITY)

**Current Status**: Uses mock data  
**File**: `src/pages/RunDetails.tsx`

**Tasks**:
- [ ] Create `useRun(id)` hook for single run details
- [ ] Create `useRunSteps(runId)` hook
- [ ] Create `useRunLogs(runId)` hook
- [ ] Integrate real-time updates via WebSocket
- [ ] Implement cancel/retry functionality
- [ ] Add proper error handling

---

### 3. **Edit/Update Dialogs** (MEDIUM PRIORITY)

**Missing Components**:
- [ ] `EditAgentDialog.tsx` - Update agent configuration
- [ ] `EditWorkflowDialog.tsx` - Update workflow details
- [ ] `EditToolDialog.tsx` - Update tool configuration

**Features Needed**:
- Pre-populate form with existing data
- Validation
- Optimistic updates
- Toast notifications

---

### 4. **Delete Confirmations** (MEDIUM PRIORITY)

**Missing Components**:
- [ ] `DeleteConfirmDialog.tsx` - Reusable delete confirmation
- [ ] Integrate into Agents page
- [ ] Integrate into Workflows page
- [ ] Integrate into Tools page

**Features**:
- Confirmation modal
- Soft delete vs hard delete
- Cascade delete warnings

---

### 5. **Run Creation Dialog** (HIGH PRIORITY)

**Component**: `src/components/runs/CreateRunDialog.tsx`

**Tasks**:
- [ ] Create component with form
- [ ] Workflow selection dropdown
- [ ] Agent selection dropdown
- [ ] Input parameters (JSON editor)
- [ ] Trigger type selection
- [ ] Environment selection
- [ ] Submit and track run

---

### 6. **Pagination UI** (MEDIUM PRIORITY)

**Current Status**: Pagination logic exists, no UI controls

**Tasks**:
- [ ] Create `Pagination` component
- [ ] Add to Agents page
- [ ] Add to Workflows page
- [ ] Add to Runs page
- [ ] Add to Tools page
- [ ] Show total count, current page, page size

---

### 7. **Advanced Filtering** (MEDIUM PRIORITY)

**Missing Features**:
- [ ] Date range picker
- [ ] Multi-select filters (select multiple statuses)
- [ ] Saved filter presets
- [ ] Clear all filters button
- [ ] Filter chips showing active filters

**Pages to Update**:
- Runs page
- Agents page
- Workflows page

---

### 8. **Bulk Operations** (LOW PRIORITY)

**Missing Features**:
- [ ] Checkbox selection for table rows
- [ ] Select all / deselect all
- [ ] Bulk delete
- [ ] Bulk status change
- [ ] Bulk tag editing

---

### 9. **Agent Details Page** (MEDIUM PRIORITY)

**New Page**: `src/pages/AgentDetails.tsx`

**Features**:
- [ ] Real-time health monitoring (30s refresh)
- [ ] Configuration details
- [ ] Run history for this agent
- [ ] Metrics charts (latency, cost, success rate)
- [ ] Edit agent button
- [ ] Delete agent button
- [ ] Deploy/scale controls

---

### 10. **Workflow Editor** (LOW PRIORITY)

**New Page**: `src/pages/WorkflowEditor.tsx`

**Features**:
- [ ] Visual workflow builder (drag-and-drop)
- [ ] Step configuration panels
- [ ] Version management UI
- [ ] Test workflow button
- [ ] Publish workflow (draft → released)
- [ ] Workflow validation
- [ ] Save draft

---

### 11. **Analytics Dashboard** (MEDIUM PRIORITY)

**File**: `src/pages/Analytics.tsx` (exists but needs integration)

**Tasks**:
- [ ] Create analytics API hooks
- [ ] Replace mock charts with real data
- [ ] Cost analysis charts
- [ ] Performance metrics
- [ ] Resource utilization
- [ ] Date range selector
- [ ] Export to CSV

---

### 12. **Approvals Page** (LOW PRIORITY)

**File**: `src/pages/Approvals.tsx` (exists but needs backend)

**Tasks**:
- [ ] Create `useApprovals` hook
- [ ] Integrate with backend API
- [ ] Approve/reject buttons
- [ ] Approval history
- [ ] Pending approvals count badge
- [ ] Email/webhook notifications

---

### 13. **Policies Page** (LOW PRIORITY)

**File**: `src/pages/Policies.tsx` (exists but needs backend)

**Tasks**:
- [ ] Create `usePolicies` hook
- [ ] Policy CRUD operations
- [ ] Policy editor
- [ ] Violation tracking
- [ ] Policy testing

---

### 14. **Real-time Updates** (HIGH PRIORITY)

**Missing Features**:
- [ ] WebSocket connection setup
- [ ] Run status live updates
- [ ] Agent health live updates
- [ ] Activity feed live updates
- [ ] Toast notifications for events
- [ ] Reconnection logic

---

### 15. **Error Boundaries** (MEDIUM PRIORITY)

**Current Status**: Basic ErrorBoundary exists

**Tasks**:
- [ ] Add error boundaries to all routes
- [ ] Custom error pages
- [ ] Error logging/tracking
- [ ] User-friendly error messages
- [ ] Retry mechanisms

---

### 16. **Export Functionality** (LOW PRIORITY)

**Missing Features**:
- [ ] Export runs to CSV
- [ ] Export agents to CSV
- [ ] Export workflows to JSON
- [ ] Export analytics to Excel
- [ ] Scheduled exports

---

## 🔧 Technical Debt

### 1. **Testing** (HIGH PRIORITY)

**Missing**:
- [ ] Backend unit tests
- [ ] Backend integration tests
- [ ] Frontend component tests
- [ ] Frontend E2E tests (Playwright/Cypress)
- [ ] API contract tests

---

### 2. **Documentation** (MEDIUM PRIORITY)

**Missing**:
- [ ] API documentation (OpenAPI/Swagger improved)
- [ ] Component documentation (Storybook)
- [ ] Developer onboarding guide
- [ ] Deployment guide
- [ ] User manual

---

### 3. **Performance Optimization** (MEDIUM PRIORITY)

**Needed**:
- [ ] Database query optimization
- [ ] API response caching
- [ ] Frontend bundle optimization
- [ ] Image optimization
- [ ] Lazy loading improvements

---

### 4. **Security Enhancements** (HIGH PRIORITY)

**Needed**:
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Content Security Policy

---

### 5. **Monitoring & Logging** (MEDIUM PRIORITY)

**Missing**:
- [ ] Application logging (structured logs)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic, Datadog)
- [ ] Uptime monitoring
- [ ] Database monitoring

---

## 📊 Priority Matrix

### Must Have (High Priority)
1. ✅ Backend: Run management endpoints
2. ✅ Frontend: Tools page integration
3. ✅ Frontend: Run details integration
4. ✅ Frontend: Run creation dialog
5. ✅ Real-time updates (WebSocket)
6. ✅ Security enhancements
7. ✅ Testing infrastructure

### Should Have (Medium Priority)
1. Agent details page
2. Edit/update dialogs
3. Pagination UI
4. Advanced filtering
5. Analytics integration
6. Error boundaries
7. Performance optimization
8. Monitoring & logging

### Nice to Have (Low Priority)
1. Workflow editor
2. Bulk operations
3. Approvals system
4. Policies & governance
5. Export functionality
6. Scheduled tasks

---

## 🎯 Recommended Implementation Order

### Phase 1: Complete Core CRUD (Week 1-2)
1. Implement missing Run endpoints (create, cancel, retry)
2. Implement Tools CRUD endpoints
3. Implement Agent/Workflow update/delete endpoints
4. Create useTools hook
5. Integrate Tools page
6. Create Run creation dialog
7. Create Edit/Delete dialogs

### Phase 2: Run Details & Monitoring (Week 3-4)
1. Implement run steps/logs endpoints
2. Integrate Run Details page
3. Add real-time WebSocket updates
4. Implement agent health monitoring
5. Create Agent Details page

### Phase 3: Advanced Features (Week 5-6)
1. Pagination UI components
2. Advanced filtering
3. Analytics integration
4. Bulk operations
5. Export functionality

### Phase 4: Polish & Deploy (Week 7-8)
1. Error boundaries
2. Testing (unit + E2E)
3. Performance optimization
4. Security audit
5. Documentation
6. Production deployment

---

## 📝 Notes

### Current Blockers
- ❌ No WebSocket implementation (blocking real-time updates)
- ❌ No run execution endpoint (blocking run creation)
- ❌ No analytics aggregation (blocking analytics dashboard)

### Quick Wins
- ✅ Add pagination UI (frontend only, backend ready)
- ✅ Add edit dialogs (similar to create dialogs)
- ✅ Integrate Tools page (backend ready)
- ✅ Add delete confirmations (frontend only)

---

## 🚀 Getting Started

To work on pending features, see:
- [`INTEGRATION_COMPLETE.md`](./INTEGRATION_COMPLETE.md) - Developer guide
- [`TESTING_CHECKLIST.md`](./TESTING_CHECKLIST.md) - Testing procedures
- [`QUICK_START.md`](./QUICK_START.md) - Setup instructions

---

**Status**: 60% Complete  
**Next Milestone**: Core CRUD operations (Phase 1)  
**Target Completion**: 8 weeks for all features
