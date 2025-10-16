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
import { AuthProvider } from "@/hooks/useAuth";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
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
            <AuthProvider>
              <ProjectProvider>
                <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Test Route */}
                  <Route path="/test" element={<ProtectedRoute><AppLayout><TestPage /></AppLayout></ProtectedRoute>} />
                  
                  {/* Protected Orchestrator Routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
                  <Route path="/runs" element={<ProtectedRoute><AppLayout><Runs /></AppLayout></ProtectedRoute>} />
                  <Route path="/runs/:id" element={<ProtectedRoute><AppLayout><RunDetails /></AppLayout></ProtectedRoute>} />
                  <Route path="/agents" element={<ProtectedRoute><AppLayout><Agents /></AppLayout></ProtectedRoute>} />
                  <Route path="/tools" element={<ProtectedRoute><AppLayout><Tools /></AppLayout></ProtectedRoute>} />
                  <Route path="/approvals" element={<ProtectedRoute><AppLayout><Approvals /></AppLayout></ProtectedRoute>} />
                  <Route path="/evaluations" element={<ProtectedRoute><AppLayout><Evaluations /></AppLayout></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
                  <Route path="/policies" element={<ProtectedRoute requiredRole="admin"><AppLayout><Policies /></AppLayout></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
                  <Route path="/teams" element={<ProtectedRoute requiredRole="admin"><AppLayout><Teams /></AppLayout></ProtectedRoute>} />
                  <Route path="/workflows/builder" element={<ProtectedRoute><AppLayout><WorkflowBuilder /></AppLayout></ProtectedRoute>} />
                  <Route path="/workflows/studio" element={<ProtectedRoute><AppLayout><WorkflowStudio /></AppLayout></ProtectedRoute>} />
                  
                  {/* Protected Maestro Routes */}
                  <Route path="/maestro" element={<ProtectedRoute><MaestroLayout><MaestroDashboard /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/agents" element={<ProtectedRoute><MaestroLayout><MaestroAgents /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/workflows" element={<ProtectedRoute><MaestroLayout><MaestroWorkflows /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/observability" element={<ProtectedRoute><MaestroLayout><MaestroObservability /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/governance" element={<ProtectedRoute requiredRole="admin"><MaestroLayout><MaestroGovernance /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/integrations" element={<ProtectedRoute requiredRole="developer"><MaestroLayout><MaestroIntegrations /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/settings" element={<ProtectedRoute><MaestroLayout><MaestroSettings /></MaestroLayout></ProtectedRoute>} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ProjectProvider>
            </AuthProvider>
            {/* React Query DevTools - only in development */}
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;