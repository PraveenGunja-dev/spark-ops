import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageSkeleton } from "@/components/ui/loading-skeleton";
import { AppLayout } from "./components/layout/AppLayout";
import { MaestroLayout } from "./components/layout/MaestroLayout";
import { ThemeProvider } from "next-themes";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const TestPage = lazy(() => import("./pages/TestPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Runs = lazy(() => import("./pages/Runs"));
const RunDetails = lazy(() => import("./pages/RunDetails"));
const Agents = lazy(() => import("./pages/Agents"));
const Tools = lazy(() => import("./pages/Tools"));
const Approvals = lazy(() => import("./pages/Approvals"));
const Evaluations = lazy(() => import("./pages/Evaluations"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Policies = lazy(() => import("./pages/Policies"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const Teams = lazy(() => import("./pages/Teams"));
const WorkflowBuilder = lazy(() => import("./pages/WorkflowBuilder"));
const WorkflowStudio = lazy(() => import("./pages/WorkflowStudio"));
const Maestro = lazy(() => import("./pages/Maestro"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MaestroDashboard = lazy(() => import("./pages/maestro/MaestroDashboard"));
const MaestroAgents = lazy(() => import("./pages/maestro/MaestroAgents"));
const MaestroWorkflows = lazy(() => import("./pages/maestro/MaestroWorkflows"));
const MaestroObservability = lazy(() => import("./pages/maestro/MaestroObservability"));
const MaestroGovernance = lazy(() => import("./pages/maestro/MaestroGovernance"));
const MaestroIntegrations = lazy(() => import("./pages/maestro/MaestroIntegrations"));
const MaestroSettings = lazy(() => import("./pages/maestro/MaestroSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="theme" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Home */}
                <Route path="/" element={<Index />} />
                
                {/* Test Route */}
                <Route path="/test" element={<AppLayout><TestPage /></AppLayout>} />
                
                {/* Orchestrator Routes */}
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/runs" element={<AppLayout><Runs /></AppLayout>} />
                <Route path="/runs/:id" element={<AppLayout><RunDetails /></AppLayout>} />
                <Route path="/agents" element={<AppLayout><Agents /></AppLayout>} />
                <Route path="/tools" element={<AppLayout><Tools /></AppLayout>} />
                <Route path="/approvals" element={<AppLayout><Approvals /></AppLayout>} />
                <Route path="/evaluations" element={<AppLayout><Evaluations /></AppLayout>} />
                <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
                <Route path="/policies" element={<AppLayout><Policies /></AppLayout>} />
                <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
                <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
                <Route path="/teams" element={<AppLayout><Teams /></AppLayout>} />
                <Route path="/workflows/builder" element={<AppLayout><WorkflowBuilder /></AppLayout>} />
                <Route path="/workflows/studio" element={<AppLayout><WorkflowStudio /></AppLayout>} />
                
                {/* Maestro Routes */}
                <Route path="/maestro" element={<MaestroLayout><MaestroDashboard /></MaestroLayout>} />
                <Route path="/maestro/agents" element={<MaestroLayout><MaestroAgents /></MaestroLayout>} />
                <Route path="/maestro/workflows" element={<MaestroLayout><MaestroWorkflows /></MaestroLayout>} />
                <Route path="/maestro/observability" element={<MaestroLayout><MaestroObservability /></MaestroLayout>} />
                <Route path="/maestro/governance" element={<MaestroLayout><MaestroGovernance /></MaestroLayout>} />
                <Route path="/maestro/integrations" element={<MaestroLayout><MaestroIntegrations /></MaestroLayout>} />
                <Route path="/maestro/settings" element={<MaestroLayout><MaestroSettings /></MaestroLayout>} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          {/* React Query DevTools - only in development */}
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;