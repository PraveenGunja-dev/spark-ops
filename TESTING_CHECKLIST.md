# 🧪 Spark-Ops Control Plane - Testing Checklist

**Date**: October 15, 2025  
**Integration Status**: ✅ Complete

---

## 🎯 Pre-Testing Setup

### 1. Backend Server Running
- [ ] Navigate to `backend/` directory
- [ ] Activate virtual environment: `.\venv\Scripts\Activate.ps1`
- [ ] Start server: `python -m uvicorn app.main:app --reload`
- [ ] Verify server at: `http://localhost:8000`
- [ ] Check Swagger UI: `http://localhost:8000/docs`

### 2. Frontend Server Running
- [ ] Navigate to root directory
- [ ] Start dev server: `npm run dev`
- [ ] Verify server at: `http://localhost:5173` (or alternate port)

### 3. Database Setup
- [ ] PostgreSQL running
- [ ] Database migrations applied: `cd backend && alembic upgrade head`
- [ ] Test data seeded (optional)

### 4. User Account
- [ ] Register new user via `/register` page
- [ ] Or use existing test account
- [ ] Login and verify authentication token stored

---

## ✅ Integration Testing

### Phase 1: Authentication & Authorization

#### Login/Register Flow
- [ ] Go to `/login`
- [ ] Try invalid credentials → Error message shown
- [ ] Login with valid credentials → Redirect to dashboard
- [ ] Check localStorage for `token` key
- [ ] Logout → Token cleared, redirect to login

#### Protected Routes
- [ ] Without login, try accessing `/dashboard` → Redirect to `/login`
- [ ] After login, try accessing `/dashboard` → Success
- [ ] Refresh page while logged in → Still logged in

**Expected Behavior**: JWT token persists in localStorage, all API requests include token in headers

---

### Phase 2: Project Selection

#### Auto-Selection
- [ ] Login to fresh account with no projects
- [ ] Create first project via API or Swagger UI
- [ ] Reload dashboard → Project should auto-select
- [ ] Check localStorage for `selectedProjectId`

#### Manual Selection
- [ ] Create 2+ projects
- [ ] Open ProjectSelector dropdown → All projects visible
- [ ] Select different project → UI updates
- [ ] Reload page → Selected project persists

#### Cross-Page Consistency
- [ ] Select Project A in Dashboard
- [ ] Navigate to Agents page → Project A still selected
- [ ] Navigate to Workflows page → Project A still selected
- [ ] Navigate to Runs page → Project A still selected

**Expected Behavior**: 
- First project auto-selects on mount
- Selection persists in localStorage
- All pages share the same selected project

---

### Phase 3: Dashboard Page

#### KPI Cards
- [ ] Check "Agents Active" card → Shows count of healthy agents
- [ ] Check "Runs Executing" card → Shows count of running runs
- [ ] Check "Avg Latency" card → Shows average run duration
- [ ] Check "Tokens / Cost" card → Shows total cost
- [ ] Check "Success Rate" card → Shows percentage

#### Charts
- [ ] "Runs per Hour" chart displays data
- [ ] "Avg Cost per Run" chart displays data
- [ ] Hover over chart points → Tooltip shows values

#### Activity Feed
- [ ] Recent events displayed
- [ ] Event icons match type (error, success, warning, info)

#### System Health
- [ ] Worker nodes status shown
- [ ] Queue backlog shown
- [ ] Database metrics shown
- [ ] Policy violations shown

**Expected Behavior**: 
- All KPIs calculated from real API data
- Charts may use mock data initially (future: real analytics)
- No crashes or errors in console

---

### Phase 4: Agents Page

#### Agent List Display
- [ ] All agents for selected project shown
- [ ] Agent table shows: name, runtime, health, metrics
- [ ] Empty state shown when no agents exist
- [ ] Loading skeleton shown while fetching

#### Create Agent Dialog
- [ ] Click "Create New Agent" button → Dialog opens
- [ ] Fill all required fields:
  - [ ] Name (required)
  - [ ] Runtime (required) - select from dropdown
  - [ ] Model (required) - select from dropdown
  - [ ] Provider (required) - select from dropdown
  - [ ] Temperature (0-2, default 0.7)
  - [ ] Max concurrent runs (default 5)
- [ ] Submit form → Toast "Agent created successfully"
- [ ] Dialog closes automatically
- [ ] New agent appears in table immediately

#### Form Validation
- [ ] Try submitting without name → Validation error
- [ ] Try submitting without runtime → Validation error
- [ ] Try invalid temperature (e.g., 3) → Validation error
- [ ] Try invalid concurrency (e.g., -1) → Validation error

#### Error Handling
- [ ] Disconnect internet → Try creating agent → Toast error
- [ ] Submit duplicate agent name → Toast error
- [ ] Check console for no unhandled errors

**Expected Behavior**:
- React Query automatically refetches agents after creation
- Toast notifications provide user feedback
- Form resets after successful submission

---

### Phase 5: Workflows Page

#### Workflow List Display
- [ ] All workflows for selected project shown
- [ ] Workflow cards show: name, tags, version, metrics
- [ ] Empty state shown when no workflows exist
- [ ] Loading state shown while fetching

#### Create Workflow Dialog
- [ ] Click "Create Workflow" button → Dialog opens
- [ ] Fill required fields:
  - [ ] Name (required)
  - [ ] Description (optional)
  - [ ] Tags (optional, comma-separated)
- [ ] Submit form → Toast "Workflow created successfully"
- [ ] Dialog closes automatically
- [ ] New workflow appears in list immediately

#### Workflow Details
- [ ] Check current version (v1 for new workflows)
- [ ] Check version history section
- [ ] Check avg duration (null for new workflows)
- [ ] Check success rate (null for new workflows)
- [ ] Check last run date (null for new workflows)

#### Form Validation
- [ ] Try submitting without name → Validation error
- [ ] Try very long name (500+ chars) → Validation error

**Expected Behavior**:
- New workflows start at version 1
- Version history shows all versions
- Metrics are null until first run

---

### Phase 6: Runs Page

#### Run List Display
- [ ] All runs shown (regardless of project initially)
- [ ] Run table shows: ID, agent, status, duration, tokens, cost
- [ ] Empty state shown when no runs exist
- [ ] Table skeleton shown while loading

#### Search & Filters
- [ ] Search by run ID → Table filters
- [ ] Clear search → All runs shown
- [ ] Filter by status (running) → Only running runs shown
- [ ] Filter by agent → Only that agent's runs shown
- [ ] Combine filters → Works correctly
- [ ] Clear all filters → All runs shown

#### Run Details
- [ ] Click "View" button → (Future: Run details page)
- [ ] Click "Replay" button → (Future: Replay run)
- [ ] Click "Terminate" button on running run → (Future: Terminate)
- [ ] Terminate button disabled for non-running runs ✅

#### Data Accuracy
- [ ] Agent names resolved correctly (not just IDs)
- [ ] Workflow names resolved correctly (not just IDs)
- [ ] Status badges colored correctly:
  - [ ] Running → Blue
  - [ ] Succeeded → Green
  - [ ] Failed → Red
  - [ ] Queued → Yellow
- [ ] Duration formatted correctly (ms → seconds)
- [ ] Tokens formatted with commas (1,234,567)
- [ ] Cost formatted to 4 decimal places ($0.0123)

**Expected Behavior**:
- Filters work without page reload
- Search is client-side (instant)
- Status and agent filters are server-side

---

### Phase 7: Cross-Page Data Consistency

#### Scenario: Create Agent and Use It
1. [ ] Go to Agents page
2. [ ] Create agent "TestAgent"
3. [ ] Go to Runs page
4. [ ] Agent filter dropdown shows "TestAgent"
5. [ ] Go to Dashboard
6. [ ] "Agents Active" count increased by 1

#### Scenario: Switch Projects
1. [ ] Select Project A
2. [ ] Note agents count
3. [ ] Select Project B
4. [ ] Agents count changes (different data)
5. [ ] Go to Workflows → Different workflows shown
6. [ ] Switch back to Project A → Original data shown

**Expected Behavior**:
- Data updates across all pages when project changes
- React Query caching prevents unnecessary refetches
- No stale data shown

---

## 🎨 UI/UX Testing

### Responsive Design
- [ ] Test on mobile (< 640px) → Single column layout
- [ ] Test on tablet (768px) → 2 column layout
- [ ] Test on desktop (1024px+) → 4+ column layout
- [ ] All buttons and inputs are touchable on mobile
- [ ] No horizontal scrolling

### Loading States
- [ ] Throttle network in DevTools to 3G
- [ ] Navigate to Agents → Skeleton loader shown
- [ ] Navigate to Workflows → "Loading..." message
- [ ] Navigate to Runs → Table skeleton shown
- [ ] Dashboard → All cards show loading state

### Error States
- [ ] Stop backend server
- [ ] Try creating agent → Toast error "Failed to create agent"
- [ ] Try loading agents → Error state shown
- [ ] Restart backend → Data loads normally

### Empty States
- [ ] Create new project with no data
- [ ] Agents page → "No agents found. Create your first agent to get started."
- [ ] Workflows page → "No workflows found. Create your first workflow to get started."
- [ ] Runs page → "No runs found."

### Toast Notifications
- [ ] Create agent successfully → Green success toast
- [ ] Create agent with error → Red error toast
- [ ] Create workflow successfully → Green success toast
- [ ] Form validation error → Red toast
- [ ] Toasts auto-dismiss after 3 seconds
- [ ] Multiple toasts stack properly

---

## 🔒 Security Testing

### Authentication
- [ ] Logout → Token removed from localStorage
- [ ] Try API request without token → 401 Unauthorized
- [ ] Try accessing another user's project → 403 Forbidden
- [ ] Token expires → Auto-logout and redirect to login

### Authorization
- [ ] User A creates Project 1
- [ ] User B creates Project 2
- [ ] User A cannot see Project 2 in dropdown
- [ ] User B cannot see Project 1 in dropdown

### XSS Prevention
- [ ] Try agent name: `<script>alert('XSS')</script>`
- [ ] Submit form → Name displayed as plain text (no script execution)

---

## ⚡ Performance Testing

### Load Time
- [ ] Hard refresh dashboard → Page loads in < 2 seconds
- [ ] Navigate between pages → Instant (React Router)
- [ ] First API call → Response in < 500ms (local)

### Caching
- [ ] Load agents page → API called
- [ ] Navigate to Workflows → No agents API call
- [ ] Navigate back to Agents → No API call (cached)
- [ ] Wait 5 minutes → React Query refetches in background

### Data Size
- [ ] Create 100+ agents → Pagination works
- [ ] Create 100+ workflows → No performance issues
- [ ] Large run list (1000+) → Table renders smoothly

---

## 🐛 Error Scenarios

### Network Errors
- [ ] Disconnect internet mid-request → Error toast shown
- [ ] Backend crashes during request → Error toast shown
- [ ] Slow connection (3G) → Loading states shown

### Invalid Data
- [ ] Backend returns 404 for agent → Error handled
- [ ] Backend returns malformed JSON → Error handled
- [ ] Backend returns 500 error → Error toast shown

### Browser Compatibility
- [ ] Test in Chrome → Works
- [ ] Test in Firefox → Works
- [ ] Test in Edge → Works
- [ ] Test in Safari (if available) → Works

---

## 📊 Data Flow Testing

### React Query Flow
1. [ ] Open browser DevTools → React Query DevTools
2. [ ] Navigate to Agents → See `['agents', projectId, 1, 20]` query
3. [ ] Create new agent → Query invalidated and refetched
4. [ ] See agent list update without page reload

### Form Submission Flow
1. [ ] Fill create agent form
2. [ ] Click submit → Button shows "Creating..."
3. [ ] API request sent (check Network tab)
4. [ ] Response received (200 OK)
5. [ ] Toast shown
6. [ ] Dialog closes
7. [ ] React Query invalidates `['agents']`
8. [ ] Agents list refetched automatically
9. [ ] New agent appears

---

## 🎯 Acceptance Criteria

### All Must Pass ✅

- [ ] **Authentication**: Users can register, login, logout
- [ ] **Project Selection**: Projects auto-select and persist
- [ ] **Agent Creation**: Users can create agents with full validation
- [ ] **Workflow Creation**: Users can create workflows
- [ ] **Data Display**: All pages show real API data
- [ ] **Filtering**: Runs page filters work correctly
- [ ] **Loading States**: All async operations show loading UI
- [ ] **Error Handling**: Errors show user-friendly messages
- [ ] **Toast Notifications**: Success/error feedback shown
- [ ] **Responsive**: Works on mobile, tablet, desktop
- [ ] **Type Safety**: No TypeScript errors
- [ ] **No Console Errors**: No unhandled errors in browser console

---

## 📝 Bug Report Template

If you find any issues, report them using this format:

```markdown
### Bug: [Short Description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots**:
[If applicable]

**Console Errors**:
[Copy any errors from browser console]

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Backend version: [Check /health endpoint]
- Frontend version: [Check package.json]
```

---

## ✅ Sign-off

Once all tests pass, sign off below:

**Tester Name**: ___________________  
**Date**: ___________________  
**Status**: ☐ Passed ☐ Failed  

**Notes**:
```
[Any additional comments or observations]
```

---

## 🚀 Next Steps After Testing

1. **Deploy to Staging**:
   - Build frontend: `npm run build`
   - Deploy backend to staging server
   - Run full test suite on staging

2. **Performance Optimization**:
   - Enable React Query persistence
   - Add service worker for offline support
   - Optimize bundle size

3. **Feature Development**:
   - Run details page
   - Agent details page
   - Workflow editor
   - Real-time WebSocket updates

4. **Monitoring**:
   - Add error tracking (Sentry)
   - Add analytics (PostHog, Mixpanel)
   - Set up uptime monitoring

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0  
**Status**: Ready for Testing
