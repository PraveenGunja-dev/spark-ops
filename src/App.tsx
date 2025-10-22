import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageSkeleton } from "@/components/ui/loading-skeleton";
import { MaestroLayout } from "./components/layout/MaestroLayout";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

// APA/Maestro Pages
const MaestroDashboard = lazy(() => import("./pages/maestro/MaestroDashboard"));
const MaestroAgents = lazy(() => import("./pages/maestro/MaestroAgents"));
const MaestroWorkflows = lazy(() => import("./pages/maestro/MaestroWorkflows"));
const MaestroObservability = lazy(() => import("./pages/maestro/MaestroObservability"));
const MaestroGovernance = lazy(() => import("./pages/maestro/MaestroGovernance"));
const MaestroIntegrations = lazy(() => import("./pages/maestro/MaestroIntegrations"));
const MaestroSettings = lazy(() => import("./pages/maestro/MaestroSettings"));

// Keep essential APA pages
const AgentDetails = lazy(() => import("./pages/AgentDetails"));
const HITLDashboard = lazy(() => import("./pages/HITLDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Teams = lazy(() => import("./pages/Teams"));

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
                  
                  {/* Redirect old routes to Maestro */}
                  <Route path="/dashboard" element={<Navigate to="/maestro" replace />} />
                  <Route path="/orchestrator/*" element={<Navigate to="/maestro" replace />} />
                  
                  {/* APA/Maestro Routes (Main Application) */}
                  <Route path="/maestro" element={<ProtectedRoute><MaestroLayout><MaestroDashboard /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/agents" element={<ProtectedRoute><MaestroLayout><MaestroAgents /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/agents/:id" element={<ProtectedRoute><MaestroLayout><AgentDetails /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/workflows" element={<ProtectedRoute><MaestroLayout><MaestroWorkflows /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/observability" element={<ProtectedRoute><MaestroLayout><MaestroObservability /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/governance" element={<ProtectedRoute requiredRole="admin"><MaestroLayout><MaestroGovernance /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/hitl" element={<ProtectedRoute><MaestroLayout><HITLDashboard /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/integrations" element={<ProtectedRoute requiredRole="developer"><MaestroLayout><MaestroIntegrations /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/maestro/settings" element={<ProtectedRoute><MaestroLayout><MaestroSettings /></MaestroLayout></ProtectedRoute>} />
                  
                  {/* System Routes */}
                  <Route path="/profile" element={<ProtectedRoute><MaestroLayout><Profile /></MaestroLayout></ProtectedRoute>} />
                  <Route path="/teams" element={<ProtectedRoute requiredRole="admin"><MaestroLayout><Teams /></MaestroLayout></ProtectedRoute>} />
                  
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