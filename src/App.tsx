import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Runs from "./pages/Runs";
import RunDetails from "./pages/RunDetails";
import Workflows from "./pages/Workflows";
import Agents from "./pages/Agents";
import Tools from "./pages/Tools";
import Schedules from "./pages/Schedules";
import Queues from "./pages/Queues";
import Monitoring from "./pages/Monitoring";
import Incidents from "./pages/Incidents";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/runs" element={<Runs />} />
            <Route path="/runs/:id" element={<RunDetails />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/queues" element={<Queues />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
