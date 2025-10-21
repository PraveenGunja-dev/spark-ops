# 🏗️ Architecture Overview - High Priority Features

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Interface (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Dashboard   │  │     Runs     │  │    Agents    │         │
│  │    Page      │  │     Page     │  │     Page     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
│         └─────────────────┴──────────────────┘                  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
            ┌───────────────┴────────────────┐
            │      Error Boundary Layer      │
            │  (Catches rendering errors)    │
            └───────────────┬────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                  React Query Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  useRuns()   │  │ useAgents()  │  │useWorkflows()│         │
│  │              │  │              │  │              │         │
│  │ - Caching    │  │ - Caching    │  │ - Caching    │         │
│  │ - Refetching │  │ - Refetching │  │ - Refetching │         │
│  │ - Mutations  │  │ - Mutations  │  │ - Mutations  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
│         └─────────────────┴──────────────────┘                  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                     API Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  runsAPI     │  │  agentsAPI   │  │ workflowsAPI │         │
│  │              │  │              │  │              │         │
│  │ .list()      │  │ .list()      │  │ .list()      │         │
│  │ .getById()   │  │ .getById()   │  │ .getById()   │         │
│  │ .create()    │  │ .create()    │  │ .create()    │         │
│  │ .cancel()    │  │ .update()    │  │ .update()    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
│         └─────────────────┴──────────────────┘                  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                  API Client (api-client.ts)                     │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  apiGet(), apiPost(), apiPut(), apiDelete()            │    │
│  │                                                         │    │
│  │  • Error Handling (ApiException)                       │    │
│  │  • Timeout Protection (30s)                            │    │
│  │  • Request Cancellation (AbortController)              │    │
│  │  • JSON Serialization                                  │    │
│  │  • Headers Management                                  │    │
│  └─────────────────────────┬──────────────────────────────┘    │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Backend API    │
                    │ (Future)        │
                    └─────────────────┘
```

---

## Data Flow - Fetching Runs

```
User Action: Opens Runs Page
         │
         ▼
┌─────────────────────────┐
│   Runs.tsx Component    │
│                         │
│  const { data,          │
│         isLoading,      │
│         error }         │
│    = useRuns();         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   use-runs.ts Hook      │
│                         │
│  useQuery({             │
│    queryKey: [...],     │
│    queryFn: () =>       │
│      runsAPI.list()     │
│  })                     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    runs.ts API          │
│                         │
│  runsAPI.list()         │
│    ↓                    │
│  apiGet('/runs')        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   api-client.ts         │
│                         │
│  fetch(url, options)    │
│    • Add headers        │
│    • Set timeout        │
│    • Handle errors      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Backend Response      │
│                         │
│  { runs: [...],         │
│    total: 100 }         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   React Query Cache     │
│                         │
│  Stores data for        │
│  30 seconds (staleTime) │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Component Re-renders  │
│                         │
│  {isLoading && skeleton}│
│  {data && <Table />}    │
└─────────────────────────┘
```

---

## Error Flow

```
API Error Occurs
         │
         ▼
┌─────────────────────────┐
│   api-client.ts         │
│                         │
│  throw new              │
│    ApiException()       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   React Query           │
│                         │
│  Catches error          │
│  Sets error state       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Component             │
│                         │
│  if (error) {           │
│    show error UI        │
│  }                      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Toast Notification    │
│                         │
│  "Error loading runs"   │
│  [Dismiss]              │
└─────────────────────────┘
```

---

## Component Error Flow

```
Component Throws Error
         │
         ▼
┌─────────────────────────┐
│   ErrorBoundary         │
│                         │
│  componentDidCatch()    │
│    • Log to console     │
│    • Log to Sentry      │
│    • Set error state    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Error UI Renders      │
│                         │
│  ┌───────────────────┐  │
│  │ ⚠️ Error          │  │
│  │                   │  │
│  │ [Try Again]       │  │
│  │ [Go Home]         │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

## Loading States Flow

```
Component Mounts
         │
         ▼
┌─────────────────────────┐
│   useRuns() Hook        │
│                         │
│  isLoading: true ✓      │
│  data: undefined        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Skeleton Renders      │
│                         │
│  <TableSkeleton         │
│    rows={10}            │
│    columns={6} />       │
└────────┬────────────────┘
         │
         │ (Data arrives)
         ▼
┌─────────────────────────┐
│   useRuns() Hook        │
│                         │
│  isLoading: false       │
│  data: {...} ✓          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Real Data Renders     │
│                         │
│  <Table                 │
│    data={data.runs} />  │
└─────────────────────────┘
```

---

## Mutation Flow (Create Run)

```
User Clicks "Create Run"
         │
         ▼
┌─────────────────────────┐
│   Component             │
│                         │
│  const { mutate }       │
│    = useCreateRun();    │
│                         │
│  mutate(data)           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   use-runs.ts Hook      │
│                         │
│  useMutation({          │
│    mutationFn: () =>    │
│      runsAPI.create()   │
│  })                     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   API Call              │
│                         │
│  POST /api/runs         │
│  { workflowId, ... }    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Success Handler       │
│                         │
│  • Invalidate cache     │
│  • Show toast           │
│  • Update UI            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Component Re-renders  │
│                         │
│  New run appears in     │
│  list automatically     │
└─────────────────────────┘
```

---

## File Structure

```
src/
├── App.tsx ──────────────────────► Wraps with ErrorBoundary
│
├── components/
│   ├── ErrorBoundary.tsx ────────► Catches React errors
│   └── ui/
│       └── loading-skeleton.tsx ──► Loading states
│
├── lib/
│   ├── api-client.ts ────────────► Core HTTP client
│   │   ├── apiGet()
│   │   ├── apiPost()
│   │   ├── apiPut()
│   │   └── apiDelete()
│   │
│   └── api/
│       ├── runs.ts ──────────────► Runs endpoints
│       ├── agents.ts ────────────► Agents endpoints
│       ├── workflows.ts ─────────► Workflows endpoints
│       └── tools.ts ─────────────► Tools endpoints
│
├── hooks/
│   └── use-runs.ts ──────────────► React Query hooks
│       ├── useRuns()
│       ├── useCreateRun()
│       ├── useCancelRun()
│       └── useRetryRun()
│
└── pages/
    └── Runs.tsx ─────────────────► Uses hooks + skeletons
```

---

## Type Safety Flow

```
TypeScript Configuration (strict: true)
         │
         ▼
┌─────────────────────────────────────┐
│   Compile-time Type Checking        │
│                                     │
│  • No implicit any                  │
│  • Strict null checks               │
│  • Unused variables detected        │
│  • Safe array access enforced       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Type Definitions (types.ts)       │
│                                     │
│  interface Run { ... }              │
│  type RunStatus = ...               │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   API Layer (fully typed)           │
│                                     │
│  runsAPI.list(): Promise<Run[]>     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   React Query Hooks (typed)         │
│                                     │
│  useRuns(): {                       │
│    data: Run[] | undefined,         │
│    isLoading: boolean,              │
│    error: Error | null              │
│  }                                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Component (fully type-safe)       │
│                                     │
│  const runs: Run[] = data?.runs     │
│  runs.map(run => run.id) // ✓      │
└─────────────────────────────────────┘
```

---

## Integration Points

### 1. Error Boundary ↔ App
```tsx
// App.tsx wraps everything
<ErrorBoundary>
  <QueryClientProvider>
    <Routes />
  </QueryClientProvider>
</ErrorBoundary>
```

### 2. React Query ↔ API Layer
```tsx
// Hook calls API
useQuery({
  queryFn: () => runsAPI.list()
})
```

### 3. Components ↔ Skeletons
```tsx
// Conditional rendering
{isLoading ? <Skeleton /> : <Data />}
```

### 4. API Client ↔ Environment
```tsx
// Reads from .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
```

---

**Last Updated**: 2025-10-15
