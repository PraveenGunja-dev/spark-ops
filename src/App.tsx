import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Original Orchestrator Routes */}
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/runs" element={<AppLayout><Runs /></AppLayout>} />
          <Route path="/runs/:id" element={<AppLayout><RunDetails /></AppLayout>} />
          <Route path="/agents" element={<AppLayout><Agents /></AppLayout>} />
          <Route path="/maestro" element={<AppLayout><Maestro /></AppLayout>} />
          <Route path="/tools" element={<AppLayout><Tools /></AppLayout>} />
          <Route path="/approvals" element={<AppLayout><Approvals /></AppLayout>} />
          <Route path="/evaluations" element={<AppLayout><Evaluations /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/policies" element={<AppLayout><Policies /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
          <Route path="/teams" element={<AppLayout><Teams /></AppLayout>} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;