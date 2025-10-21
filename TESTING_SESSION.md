# 🧪 Testing Session - Spark-Ops Control Plane

**Date**: October 16, 2025  
**Tester**: Development Team  
**Status**: In Progress

---

## ✅ **Pre-Testing Verification**

- ✅ Frontend Server: http://localhost:8080 - **Running**
- ✅ Backend Server: http://localhost:8000 - **Running**
- ✅ Backend Health: `/health` endpoint returns `{"status":"healthy"}` - **Passing**
- ✅ Swagger UI: http://localhost:8000/docs - **Available**

---

## 📋 **Testing Checklist**

### **Phase 1: Authentication & Setup** ⏳

#### Test 1.1: User Registration/Login
- [ ] Navigate to http://localhost:8080
- [ ] Click "Open Orchestrator" → Redirects to `/dashboard`
- [ ] If not logged in → Redirects to `/login`
- [ ] Register new account or login
- [ ] Verify token stored in localStorage
- [ ] Verify redirect to dashboard after login

**Status**: ⏳ Pending  
**Notes**: _To be filled during testing_

---

### **Phase 2: Project Selection** ⏳

#### Test 2.1: Auto-Selection
- [ ] Login with account that has projects
- [ ] Check ProjectSelector dropdown
- [ ] Verify first project auto-selected
- [ ] Check localStorage for `selectedProjectId`

#### Test 2.2: Manual Selection
- [ ] Open ProjectSelector dropdown
- [ ] Select different project
- [ ] Navigate to different pages
- [ ] Verify same project selected across pages
- [ ] Refresh browser (F5)
- [ ] Verify project selection persisted

**Status**: ⏳ Pending  
**Results**: _To be filled_

---

### **Phase 3: Tools Page - Full CRUD** ⏳

#### Test 3.1: View Tools List
- [ ] Navigate to `/tools`
- [ ] Verify page loads without errors
- [ ] Check if loading state shows
- [ ] Verify tools table displays

**Console Errors**: _None expected_

#### Test 3.2: Create Tool
- [ ] Click "Add New Tool" button
- [ ] Dialog opens
- [ ] Fill form:
  - Name: `Test GitHub API`
  - Tool Type: `API`
  - Auth Type: `OAuth 2.0`
  - Rate Limit: `5000`
  - Description: `GitHub REST API integration`
- [ ] Click "Create Tool"
- [ ] **Expected**: Toast "Tool 'Test GitHub API' created successfully"
- [ ] **Expected**: Dialog closes
- [ ] **Expected**: New tool appears in table
- [ ] Verify tool shows in list

**Status**: ⏳ Pending  
**Screenshot**: _To be added_

#### Test 3.3: Edit Tool
- [ ] Find "Test GitHub API" tool
- [ ] Click "Edit" button
- [ ] **Verify**: Form pre-populated with current values
- [ ] Change:
  - Name: `GitHub API v2`
  - Rate Limit: `3000`
- [ ] Click "Update Tool"
- [ ] **Expected**: Toast "Tool 'GitHub API v2' updated successfully"
- [ ] **Expected**: Changes reflected in table

**Status**: ⏳ Pending

#### Test 3.4: Delete Tool
- [ ] Click "Delete" button on test tool
- [ ] **Expected**: Confirmation dialog appears
- [ ] **Expected**: Shows tool name
- [ ] Click "Delete"
- [ ] **Expected**: Toast "Tool deleted successfully"
- [ ] **Expected**: Tool removed from table

**Status**: ⏳ Pending

#### Test 3.5: Pagination
- [ ] Verify pagination controls present (if 20+ tools)
- [ ] Click "Next" → Page 2 loads
- [ ] Click "Previous" → Page 1 loads
- [ ] Change page size to `50`
- [ ] Verify more items displayed
- [ ] Verify "Showing X to Y of Z" updates

**Status**: ⏳ Pending

---

### **Phase 4: Agents Page - CRUD** ⏳

#### Test 4.1: Create Agent (Baseline)
- [ ] Navigate to `/agents`
- [ ] Click "Create New Agent"
- [ ] Fill form:
  - Name: `TestAgent`
  - Runtime: `Python`
  - Model: `GPT-4 Turbo`
  - Provider: `OpenAI`
  - Temperature: `0.7`
  - Environment: `Development`
  - Concurrency: `5`
- [ ] Click "Create Agent"
- [ ] **Expected**: Success toast
- [ ] Verify agent in table

**Status**: ⏳ Pending

#### Test 4.2: Edit Agent
- [ ] Click "Edit" on TestAgent
- [ ] **Verify**: Form pre-populated
- [ ] Change:
  - Temperature: `0.5`
  - Concurrency: `10`
- [ ] Click "Update Agent"
- [ ] **Expected**: Success toast
- [ ] Verify changes saved

**Status**: ⏳ Pending

#### Test 4.3: Delete Agent
- [ ] Click "Delete" on TestAgent
- [ ] **Expected**: Warning about runs/configs
- [ ] Click "Delete"
- [ ] **Expected**: Agent removed

**Status**: ⏳ Pending

#### Test 4.4: Pagination
- [ ] Test pagination controls
- [ ] Test page size changes

**Status**: ⏳ Pending

---

### **Phase 5: Workflows Page - CRUD** ⏳

#### Test 5.1: Create Workflow (Baseline)
- [ ] Navigate to `/workflows`
- [ ] Click "Create Workflow"
- [ ] Fill form:
  - Name: `Test Workflow`
  - Description: `Testing workflow creation`
  - Tags: `test, automation`
- [ ] Click "Create Workflow"
- [ ] **Expected**: Success toast
- [ ] Verify workflow card appears
- [ ] Verify version 1 shown

**Status**: ⏳ Pending

#### Test 5.2: Edit Workflow
- [ ] Click "Edit" on workflow card
- [ ] **Verify**: Form pre-populated
- [ ] Change:
  - Name: `Test Workflow v2`
  - Tags: `test, automation, updated`
- [ ] Click "Update Workflow"
- [ ] **Expected**: Success toast

**Status**: ⏳ Pending

#### Test 5.3: Delete Workflow
- [ ] Click delete button (trash icon)
- [ ] **Expected**: Warning about versions
- [ ] Confirm deletion
- [ ] **Expected**: Workflow removed

**Status**: ⏳ Pending

---

### **Phase 6: Runs Page - Create & List** ⏳

#### Test 6.1: View Runs List
- [ ] Navigate to `/runs`
- [ ] Verify page loads
- [ ] Check filters work
- [ ] Check search works

**Status**: ⏳ Pending

#### Test 6.2: Create Run
**Prerequisites**: Need at least 1 agent and 1 workflow

- [ ] Click "Start New Run"
- [ ] **Verify**: Dialog opens
- [ ] **Verify**: Workflow dropdown populated
- [ ] **Verify**: Agent dropdown populated
- [ ] Fill form:
  - Workflow: Select "Test Workflow"
  - Agent: Select "TestAgent"
  - Environment: `Development`
  - Trigger: `Manual`
  - Input Data:
    ```json
    {
      "test_param": "test_value",
      "number": 123
    }
    ```
- [ ] Click "Start Run"
- [ ] **Expected**: Toast "Run started successfully"
- [ ] **Expected**: Redirects to `/runs/{id}`
- [ ] Verify run appears in runs list

**Status**: ⏳ Pending  
**Critical**: This tests the NEW feature!

#### Test 6.3: Invalid JSON
- [ ] Open Create Run dialog
- [ ] Enter invalid JSON: `{invalid`
- [ ] Click "Start Run"
- [ ] **Expected**: Toast error "Invalid JSON"

**Status**: ⏳ Pending

#### Test 6.4: Filters
- [ ] Filter by Status
- [ ] Filter by Agent
- [ ] Search by Run ID
- [ ] Verify table updates

**Status**: ⏳ Pending

---

### **Phase 7: Form Validation** ⏳

#### Test 7.1: Required Fields
- [ ] Open Create Agent dialog
- [ ] Try submitting without name
- [ ] **Expected**: Validation error
- [ ] Try submitting without runtime
- [ ] **Expected**: Validation error

**Status**: ⏳ Pending

#### Test 7.2: Invalid Values
- [ ] Open Create Agent dialog
- [ ] Enter temperature: `5` (invalid, should be 0-2)
- [ ] Try submit
- [ ] **Expected**: Validation error

**Status**: ⏳ Pending

---

### **Phase 8: Error Handling** ⏳

#### Test 8.1: Network Error
- [ ] Stop backend server
- [ ] Try creating an agent
- [ ] **Expected**: Toast error
- [ ] Restart backend
- [ ] Try again
- [ ] **Expected**: Success

**Status**: ⏳ Pending

#### Test 8.2: Empty States
- [ ] Create new project with no data
- [ ] Navigate to Agents
- [ ] **Expected**: "No agents found" message
- [ ] Navigate to Workflows
- [ ] **Expected**: "No workflows found" message

**Status**: ⏳ Pending

---

### **Phase 9: UX/UI Checks** ⏳

#### Test 9.1: Loading States
- [ ] Throttle network to 3G
- [ ] Navigate to Agents
- [ ] **Verify**: Loading state shows
- [ ] Wait for data
- [ ] **Verify**: Table appears

**Status**: ⏳ Pending

#### Test 9.2: Toast Notifications
- [ ] Perform CRUD operation
- [ ] **Verify**: Toast appears
- [ ] **Verify**: Toast auto-dismisses
- [ ] Perform multiple operations
- [ ] **Verify**: Toasts stack properly

**Status**: ⏳ Pending

#### Test 9.3: Dialog Behavior
- [ ] Open Create Agent dialog
- [ ] Fill some fields
- [ ] Click Cancel
- [ ] Re-open dialog
- [ ] **Verify**: Form reset
- [ ] Open Edit Agent dialog
- [ ] **Verify**: Form pre-populated

**Status**: ⏳ Pending

---

## 🐛 **Bugs Found**

### Bug #1
**Description**: _None yet_  
**Severity**: _N/A_  
**Steps to Reproduce**: _N/A_  
**Status**: _N/A_

---

## ✅ **Passed Tests Summary**

- Total Tests: 0
- Passed: 0
- Failed: 0
- Skipped: 0

---

## 📊 **Test Results**

### Tools Page
- Create: ⏳ Not Tested
- Edit: ⏳ Not Tested
- Delete: ⏳ Not Tested
- Pagination: ⏳ Not Tested

### Agents Page
- Create: ⏳ Not Tested
- Edit: ⏳ Not Tested
- Delete: ⏳ Not Tested
- Pagination: ⏳ Not Tested

### Workflows Page
- Create: ⏳ Not Tested
- Edit: ⏳ Not Tested
- Delete: ⏳ Not Tested

### Runs Page
- Create: ⏳ Not Tested
- List: ⏳ Not Tested
- Filters: ⏳ Not Tested

---

## 📝 **Notes**

- Testing started: _To be filled_
- Testing completed: _Not yet_
- Overall assessment: _Pending_

---

**Next Steps**:
1. Follow this checklist step by step
2. Mark checkboxes as you complete each test
3. Document any bugs found
4. Take screenshots of key features
5. Update summary at the end
