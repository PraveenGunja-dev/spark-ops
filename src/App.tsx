import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { MaestroLayout } from "./components/layout/MaestroLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Runs from "./pages/Runs";
import RunDetails from "./pages/RunDetails";
import Agents from "./pages/Agents";
import Tools from "./pages/Tools";
import Approvals from "./pages/Approvals";
import Evaluations from "./pages/Evaluations";
import Analytics from "./pages/Analytics";
import Policies from "./pages/Policies";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Teams from "./pages/Teams.tsx";
import Maestro from "./pages/Maestro";
import NotFound from "./pages/NotFound";
import MaestroDashboard from "./pages/maestro/MaestroDashboard";
import MaestroAgents from "./pages/maestro/MaestroAgents";
import MaestroWorkflows from "./pages/maestro/MaestroWorkflows";
import MaestroObservability from "./pages/maestro/MaestroObservability";
import MaestroGovernance from "./pages/maestro/MaestroGovernance";
import MaestroIntegrations from "./pages/maestro/MaestroIntegrations";
import MaestroSettings from "./pages/maestro/MaestroSettings";
import { StudioLayout } from "./components/layout/StudioLayout";
import StudioWorkspace from "./pages/studio/StudioWorkspace";
import StudioTemplates from "./pages/studio/StudioTemplates";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Index />} />
          
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
          
          {/* Maestro Routes */}
          <Route path="/maestro" element={<MaestroLayout><MaestroDashboard /></MaestroLayout>} />
          <Route path="/maestro/agents" element={<MaestroLayout><MaestroAgents /></MaestroLayout>} />
          <Route path="/maestro/workflows" element={<MaestroLayout><MaestroWorkflows /></MaestroLayout>} />
          <Route path="/maestro/observability" element={<MaestroLayout><MaestroObservability /></MaestroLayout>} />
          <Route path="/maestro/governance" element={<MaestroLayout><MaestroGovernance /></MaestroLayout>} />
          <Route path="/maestro/integrations" element={<MaestroLayout><MaestroIntegrations /></MaestroLayout>} />
          <Route path="/maestro/settings" element={<MaestroLayout><MaestroSettings /></MaestroLayout>} />
          
          {/* Studio Routes */}
          <Route path="/studio" element={<StudioLayout><StudioWorkspace /></StudioLayout>} />
          <Route path="/studio/templates" element={<StudioLayout><StudioTemplates /></StudioLayout>} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;