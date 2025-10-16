# 🚀 Spark-Ops Control Plane - Quick Start

**Status**: ✅ Dev Server Running  
**URL**: http://localhost:8080

---

## ✅ Issue Fixed

### Problem
Vite's dependency cache was corrupted, causing MIME type errors when loading modules.

### Solution
1. Killed all Node/Bun processes
2. Cleared Vite cache
3. Restarted dev server from correct directory

---

## 🎯 What to Test Now

### 1. **Open the Preview**
Click the "Spark-Ops Control Plane" preview button that appeared above to view the app.

### 2. **Navigate the Landing Page**
- You should see two cards: "Orchestrator" and "Maestro"
- Click "Open Orchestrator" to go to `/dashboard`

### 3. **Test the Dashboard**
- Should see ProjectSelector in the header (top right)
- Should see 5 KPI cards with data
- Should see charts and activity feed
- **No errors in console**

### 4. **Test Navigation**
Click each sidebar link to verify they all work:
- ✅ Dashboard (`/dashboard`)
- ✅ Runs (`/runs`)
- ✅ Agents (`/agents`)
- ✅ **Workflows (`/workflows`)** ← NEW
- ✅ Tools & Connectors
- ✅ Approvals
- ✅ Evaluations
- ✅ Analytics
- ✅ Policies & Governance

### 5. **Test Project Selection**
1. Go to any page (Dashboard, Agents, Workflows, Runs)
2. Click ProjectSelector dropdown in header
3. Select a project
4. Navigate to different pages - same project should stay selected
5. Refresh browser - project selection should persist

### 6. **Test Create Dialogs**

#### Agents Page
1. Go to `/agents`
2. Click "Create New Agent" button (top right, next to ProjectSelector)
3. Fill the form:
   - Name: TestAgent
   - Runtime: Select one (python, nodejs, etc.)
   - Model: Select one (gpt-4, claude-3, etc.)
   - Provider: openai / anthropic / etc.
   - Temperature: 0.7
   - Max concurrent runs: 5
4. Click "Create"
5. Should see success toast
6. Dialog should close
7. New agent should appear in table

#### Workflows Page
1. Go to `/workflows`
2. Click "Create Workflow" button (top right)
3. Fill the form:
   - Name: TestWorkflow
   - Description: A test workflow
   - Tags: test, demo (comma-separated)
4. Click "Create"
5. Should see success toast
6. Dialog should close
7. New workflow should appear in list

---

## 🔧 If You Still See Errors

### Clear Browser Cache
**Hard Refresh** (very important!):
- Chrome/Edge: `Ctrl + Shift + R` or `Ctrl + F5`
- Firefox: `Ctrl + Shift + R`
- Or open in **Incognito/Private mode**

### Check Console
Open DevTools (F12) → Console tab
- Should see no errors
- May see React Query DevTools initialization
- Should see successful API calls

### Restart Backend (if API calls fail)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

---

## 📊 Expected Behavior

### Navigation
- ✅ All sidebar links work
- ✅ No React Router context errors
- ✅ Pages load without dynamic import errors
- ✅ Workflows link visible in sidebar (with GitBranch icon)

### Project Selection
- ✅ ProjectSelector visible on all pages
- ✅ First project auto-selects on mount
- ✅ Selection persists in localStorage
- ✅ Selection consistent across pages

### Create Dialogs
- ✅ Forms open when clicking create buttons
- ✅ Form validation works
- ✅ Toast notifications show on success/error
- ✅ Data refreshes automatically after creation

### Data Display
- ✅ Real API data shown (not mock data)
- ✅ Loading states while fetching
- ✅ Empty states when no data
- ✅ Proper error handling

---

## 🎉 Integration Complete

All features are now integrated:
- ✅ Global project selection (ProjectContext)
- ✅ React Query hooks for all entities
- ✅ Create dialogs (Agents, Workflows)
- ✅ Toast notifications (Sonner)
- ✅ Proper routing (all pages accessible)
- ✅ Loading and empty states
- ✅ Type-safe frontend-backend communication

---

## 📚 Documentation

- [`INTEGRATION_COMPLETE.md`](./INTEGRATION_COMPLETE.md) - Full integration guide
- [`TESTING_CHECKLIST.md`](./TESTING_CHECKLIST.md) - Comprehensive testing
- [`FIXES_APPLIED.md`](./FIXES_APPLIED.md) - Router fixes
- [`FRONTEND_INTEGRATION_GUIDE.md`](./FRONTEND_INTEGRATION_GUIDE.md) - React Query patterns

---

## 🆘 Troubleshooting

### Server Won't Start
```powershell
# Kill processes
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*bun*"} | Stop-Process -Force

# Restart
npm run dev
```

### Modules Won't Load
```powershell
# Clear Vite cache
Remove-Item -Recurse -Force node_modules/.vite

# Restart server
npm run dev
```

### Still Getting Errors
```powershell
# Nuclear option - reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

---

**Last Updated**: October 16, 2025  
**Dev Server**: ✅ Running on http://localhost:8080  
**Status**: Ready for Testing
