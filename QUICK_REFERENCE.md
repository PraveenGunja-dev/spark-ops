# 🚀 Quick Reference - High Priority Features

## Error Boundary

```tsx
// Wrap components
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary fallback={<CustomError />}>
  <YourComponent />
</ErrorBoundary>
```

---

## Loading Skeletons

```tsx
import { 
  TableSkeleton, 
  KpiCardSkeleton, 
  ChartSkeleton,
  PageSkeleton 
} from '@/components/ui/loading-skeleton';

// Table
{isLoading ? <TableSkeleton rows={10} columns={6} /> : <Table />}

// KPI Card
{isLoading ? <KpiCardSkeleton /> : <KpiCard />}

// Chart
{isLoading ? <ChartSkeleton height={300} /> : <Chart />}

// Full page
if (isLoading) return <PageSkeleton />;
```

---

## API Integration

### Setup
```bash
# 1. Create .env
cp .env.example .env

# 2. Configure
VITE_API_BASE_URL=http://localhost:3000/api
```

### Use React Query Hooks
```tsx
import { useRuns, useCreateRun } from '@/hooks/use-runs';

// Fetch data
function RunsList() {
  const { data, isLoading, error } = useRuns({ status: 'running' });
  
  if (isLoading) return <TableSkeleton />;
  if (error) return <div>Error!</div>;
  
  return <div>{data.runs.length} runs</div>;
}

// Mutate data
function CreateButton() {
  const { mutate, isPending } = useCreateRun();
  
  return (
    <Button 
      onClick={() => mutate({ workflowId: 'w-1', agentId: 'a-1', env: 'prod' })}
      disabled={isPending}
    >
      Create
    </Button>
  );
}
```

### Direct API Calls (without hooks)
```tsx
import { runsAPI } from '@/lib/api';

// Fetch
const runs = await runsAPI.list({ status: 'running' });

// Create
const newRun = await runsAPI.create({ 
  workflowId: 'w-1', 
  agentId: 'a-1', 
  env: 'prod' 
});

// Error handling
try {
  await runsAPI.create(data);
} catch (error) {
  if (isApiError(error)) {
    console.log(error.status, error.message);
  }
}
```

---

## TypeScript Strict Mode

### Common Fixes

**Implicit Any:**
```tsx
// ❌ Before
const handleClick = (event) => {};

// ✅ After
const handleClick = (event: React.MouseEvent) => {};
```

**Array Access:**
```tsx
// ❌ Before
const first = items[0].name;

// ✅ After
const first = items[0]?.name ?? 'Unknown';
```

**Unused Variables:**
```tsx
// ❌ Before
const { data, error } = useQuery(); // error unused

// ✅ After - Remove
const { data } = useQuery();

// ✅ After - Prefix
const { data, error: _error } = useQuery();
```

---

## Testing

### Test Error Boundary
```tsx
function BrokenComponent() {
  throw new Error('This will be caught!');
  return <div>Never renders</div>;
}

<ErrorBoundary>
  <BrokenComponent />
</ErrorBoundary>
```

### Test Skeletons
```tsx
// Toggle to see skeleton
const [isLoading] = useState(true); // or false
```

---

## File Locations

```
src/
├── components/
│   ├── ErrorBoundary.tsx              # Error handling
│   └── ui/
│       └── loading-skeleton.tsx       # Skeletons
├── lib/
│   ├── api-client.ts                  # Core API client
│   └── api/
│       ├── runs.ts                    # Runs API
│       ├── agents.ts                  # Agents API
│       ├── workflows.ts               # Workflows API
│       └── tools.ts                   # Tools API
└── hooks/
    └── use-runs.ts                    # React Query hooks
```

---

## Cheat Sheet

| Task | Command/Code |
|------|-------------|
| **Error Boundary** | `<ErrorBoundary><App /></ErrorBoundary>` |
| **Table Skeleton** | `<TableSkeleton rows={10} columns={6} />` |
| **Fetch Runs** | `const { data } = useRuns();` |
| **Create Run** | `const { mutate } = useCreateRun();` |
| **API Error** | `if (isApiError(error)) { ... }` |
| **Safe Access** | `array[0]?.property ?? default` |

---

**Full Docs**: See `HIGH_PRIORITY_IMPROVEMENTS.md`
