# 🧪 Spark-Ops Control Plane - Complete Testing Guide

**Date**: October 16, 2025  
**Version**: 1.0  
**Status**: Ready for Testing

---

## 🎯 Prerequisites

### Backend Running
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```
**URL**: http://localhost:8000  
**Swagger UI**: http://localhost:8000/docs

### Frontend Running
```powershell
npm run dev
```
**URL**: http://localhost:8080

### Test Account
- Register a new account or use existing credentials
- Ensure you're logged in before testing

---

## ✅ **Phase 1: Tools Page Testing** (NEW - Complete CRUD)

### Test 1.1: Create Tool
1. Navigate to `/tools`
2. Click "Add New Tool" button
3. Fill form:
   - **Name**: GitHub API
   - **Tool Type**: API
   - **Auth Type**: OAuth 2.0
   - **Rate Limit**: 5000
   - **Description**: GitHub REST API integration
4. Click "Create Tool"
5. **Expected**: 
   - ✅ Toast: "Tool 'GitHub API' created successfully"
   - ✅ Dialog closes
   - ✅ New tool appears in table

### Test 1.2: Edit Tool
1. Find the tool you just created
2. Click "Edit" button
3. Change:
   - **Name**: GitHub API v2
   - **Rate Limit**: 3000
4. Click "Update Tool"
5. **Expected**:
   - ✅ Toast: "Tool 'GitHub API v2' updated successfully"
   - ✅ Changes reflected in table

### Test 1.3: Delete Tool
1. Click "Delete" button on a tool
2. **Expected**: Confirmation dialog appears
3. Click "Delete"
4. **Expected**:
   - ✅ Toast: "Tool deleted successfully"
   - ✅ Tool removed from table

### Test 1.4: Pagination
1. Create 25+ tools (or adjust page size to 10)
2. **Expected**:
   - ✅ Pagination controls appear
   - ✅ Shows "Showing 1 to 20 of 25"
3. Click "Next" button
4. **Expected**: Page 2 loads with remaining tools
5. Change page size to 50
6. **Expected**: All tools shown on one page

---

## ✅ **Phase 2: Agents Page Testing**

### Test 2.1: Create Agent
1. Navigate to `/agents`
2. Click "Create New Agent"
3. Fill form:
   - **Name**: DataAgent
   - **Runtime**: Python
   - **Model**: GPT-4 Turbo
   - **Provider**: OpenAI
   - **Temperature**: 0.7
   - **Environment**: Development
   - **Max Concurrent Runs**: 5
   - **System Prompt**: "You are a data analysis agent"
4. Click "Create Agent"
5. **Expected**:
   - ✅ Toast: "Agent 'DataAgent' created successfully"
   - ✅ Agent appears in table

### Test 2.2: Edit Agent
1. Click "Edit" on DataAgent
2. **Expected**: Form pre-populated with current values
3. Change:
   - **Temperature**: 0.5
   - **Max Concurrent Runs**: 10
4. Click "Update Agent"
5. **Expected**:
   - ✅ Toast: "Agent updated successfully"
   - ✅ Changes saved

### Test 2.3: Delete Agent
1. Click "Delete" on an agent
2. **Expected**: Warning about runs/configs
3. Click "Delete"
4. **Expected**:
   - ✅ Agent deleted
   - ✅ Toast confirmation

### Test 2.4: Pagination
1. Test pagination controls
2. **Expected**: Same behavior as Tools page

---

## ✅ **Phase 3: Workflows Page Testing**

### Test 3.1: Create Workflow
1. Navigate to `/workflows`
2. Click "Create Workflow"
3. Fill form:
   - **Name**: Customer Onboarding
   - **Description**: Automated customer onboarding process
   - **Tags**: automation, customer, onboarding
4. Click "Create Workflow"
5. **Expected**:
   - ✅ Workflow created
   - ✅ Shows version 1

### Test 3.2: Edit Workflow
1. Click "Edit" on workflow card
2. Change:
   - **Name**: Customer Onboarding v2
   - **Tags**: automation, customer, enterprise
3. Click "Update Workflow"
4. **Expected**: Changes saved

### Test 3.3: Delete Workflow
1. Click delete button (trash icon)
2. **Expected**: Warning about versions and scheduled runs
3. Confirm deletion
4. **Expected**: Workflow removed

### Test 3.4: Version History
1. View a workflow card
2. **Expected**: Version history section shows all versions
3. Check version badges
4. **Expected**: Shows v1, v2, etc. with status

---

## ✅ **Phase 4: Runs Page Testing** (NEW - Run Creation)

### Test 4.1: Create Run
1. Navigate to `/runs`
2. Click "Start New Run"
3. **Expected**: CreateRunDialog opens
4. Fill form:
   - **Workflow**: Select "Customer Onboarding"
   - **Agent**: Select "DataAgent"
   - **Environment**: Development
   - **Trigger Type**: Manual
   - **Input Data**: 
     ```json
     {
       "customer_id": "12345",
       "plan": "enterprise"
     }
     ```
5. Click "Start Run"
6. **Expected**:
   - ✅ Toast: "Run started successfully"
   - ✅ Redirects to run details page
   - ✅ Run appears in runs list

### Test 4.2: Search Runs
1. In search box, type a run ID
2. **Expected**: Table filters to matching runs

### Test 4.3: Filter by Status
1. Select "Running" from status filter
2. **Expected**: Only running runs shown
3. Select "Succeeded"
4. **Expected**: Only succeeded runs shown

### Test 4.4: Filter by Agent
1. Select an agent from agent filter
2. **Expected**: Only runs for that agent shown

### Test 4.5: Pagination
1. Verify pagination works
2. Test page size changes

---

## ✅ **Phase 5: Project Selection Testing**

### Test 5.1: Project Switching
1. Create 2+ projects (via API or create project feature if available)
2. Select Project A from dropdown
3. Navigate to Agents page
4. **Expected**: Shows agents for Project A
5. Switch to Project B
6. **Expected**: 
   - ✅ Agents list refreshes
   - ✅ Shows agents for Project B

### Test 5.2: Persistence
1. Select a project
2. Refresh browser (F5)
3. **Expected**: Same project still selected

### Test 5.3: Cross-Page Consistency
1. Select Project A in Dashboard
2. Navigate to Agents
3. **Expected**: Project A still selected
4. Navigate to Workflows
5. **Expected**: Project A still selected

---

## ✅ **Phase 6: Form Validation Testing**

### Test 6.1: Required Fields
1. Open Create Agent dialog
2. Try submitting without name
3. **Expected**: Validation error
4. Try submitting without runtime
5. **Expected**: Validation error

### Test 6.2: Invalid Input
1. Open Create Tool dialog
2. Enter rate limit as "-5"
3. **Expected**: Validation error or prevented

### Test 6.3: JSON Validation
1. Open Create Run dialog
2. Enter invalid JSON in Input Data:
   ```
   {invalid json}
   ```
3. Click "Start Run"
4. **Expected**: Toast error "Invalid JSON in input data"

---

## ✅ **Phase 7: Error Handling Testing**

### Test 7.1: Network Error
1. Stop backend server
2. Try creating an agent
3. **Expected**: Toast error "Failed to create agent"
4. Restart backend
5. Try again
6. **Expected**: Works normally

### Test 7.2: Unauthorized Access
1. Clear localStorage (delete token)
2. Try accessing `/dashboard`
3. **Expected**: Redirect to login

### Test 7.3: Duplicate Names
1. Create tool "Test Tool"
2. Try creating another tool "Test Tool"
3. **Expected**: Backend error (if enforced) or success (if allowed)

---

## ✅ **Phase 8: UX/UI Testing**

### Test 8.1: Loading States
1. Throttle network to 3G in DevTools
2. Navigate to Agents page
3. **Expected**: Loading message or skeleton shown
4. Wait for data to load
5. **Expected**: Table appears smoothly

### Test 8.2: Empty States
1. Select a project with no data
2. Navigate to Agents
3. **Expected**: "No agents found. Create your first agent to get started."
4. Navigate to Workflows
5. **Expected**: "No workflows found. Create your first workflow to get started."

### Test 8.3: Toast Notifications
1. Perform any CRUD operation
2. **Expected**: Toast appears
3. **Expected**: Toast auto-dismisses after 3-5 seconds
4. Perform multiple operations quickly
5. **Expected**: Toasts stack properly

### Test 8.4: Dialog Behavior
1. Open Create Agent dialog
2. Fill some fields
3. Click "Cancel"
4. Re-open dialog
5. **Expected**: Form is reset (empty)
6. Open Edit Agent dialog
7. **Expected**: Form pre-populated with current values

---

## ✅ **Phase 9: Pagination Testing (All Pages)**

### Test 9.1: First Page
1. Go to first page
2. **Expected**: "Previous" and "First" buttons disabled
3. **Expected**: "Next" and "Last" buttons enabled

### Test 9.2: Last Page
1. Navigate to last page
2. **Expected**: "Next" and "Last" buttons disabled
3. **Expected**: "Previous" and "First" buttons enabled

### Test 9.3: Page Size Change
1. Change page size from 20 to 50
2. **Expected**: 
   - More items shown
   - Page resets to 1
   - Total pages recalculated

---

## ✅ **Phase 10: Data Consistency Testing**

### Test 10.1: Create and Verify
1. Create a new agent "TestAgent123"
2. Verify it appears in table
3. Refresh page
4. **Expected**: Agent still there
5. Navigate away and back
6. **Expected**: Agent still there

### Test 10.2: Update and Verify
1. Edit an agent, change name to "UpdatedAgent"
2. **Expected**: Name changes in table immediately
3. Refresh page
4. **Expected**: Name still "UpdatedAgent"

### Test 10.3: Delete and Verify
1. Delete an agent
2. **Expected**: Removed from table immediately
3. Refresh page
4. **Expected**: Still deleted (not re-appearing)

---

## ✅ **Phase 11: Integration Testing**

### Test 11.1: End-to-End Workflow
1. **Create Project** (if feature available)
2. **Create Agent**: "E2E Agent"
3. **Create Workflow**: "E2E Workflow"
4. **Create Tool**: "E2E Tool"
5. **Create Run**: Use E2E Workflow + E2E Agent
6. **Verify**: Run appears in runs list
7. **Navigate**: Go to run details (if implemented)
8. **Delete**: Delete run, workflow, agent, tool in reverse order
9. **Verify**: All deleted successfully

### Test 11.2: Multi-User Scenario (if applicable)
1. Login as User A
2. Create agents/workflows
3. Logout
4. Login as User B
5. **Expected**: Cannot see User A's data
6. Create own agents/workflows
7. **Expected**: Isolated data

---

## 🐛 **Known Issues to Test**

### Issue 1: Backend Endpoints
- [ ] POST /runs works
- [ ] GET /runs/{id} works
- [ ] PATCH /runs/{id}/cancel works
- [ ] GET /runs/{id}/steps works (if implemented)

### Issue 2: Frontend State Management
- [ ] React Query cache invalidation works
- [ ] Optimistic updates work
- [ ] No duplicate API calls
- [ ] No memory leaks

---

## 📊 **Success Criteria**

### All Must Pass ✅
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Pagination works on all pages
- [ ] Project selection persists
- [ ] Form validation catches errors
- [ ] Toast notifications appear
- [ ] Loading states show
- [ ] Empty states show when no data
- [ ] Edit forms pre-populate
- [ ] Delete confirmations prevent accidents
- [ ] Run creation works and navigates to details
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No broken links

---

## 📸 **Screenshots to Take**

1. Tools page with data
2. Create Tool dialog
3. Edit Tool dialog
4. Delete confirmation
5. Agents page with pagination
6. Workflows page with cards
7. Runs page with filters
8. Create Run dialog
9. Toast notifications
10. Empty states

---

## 🚀 **Post-Testing Actions**

### If All Tests Pass
1. ✅ Mark tasks as complete
2. ✅ Update documentation
3. ✅ Prepare for deployment
4. ✅ Create release notes

### If Tests Fail
1. 📝 Document all failures
2. 🐛 Create bug tickets
3. 🔧 Prioritize fixes
4. 🔄 Re-test after fixes

---

## 📞 **Support**

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify network requests in DevTools
4. Check React Query DevTools
5. Review [`SESSION_SUMMARY.md`](./SESSION_SUMMARY.md) for implementation details

---

**Good luck with testing!** 🎯

**Last Updated**: October 16, 2025  
**Testing Status**: ⏳ Ready to Begin
