import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Reservation from "./pages/Reservation";
import Fidelite from "./pages/Fidelite";
import TicketVerification from "./pages/TicketVerification";
import AgentLogin from "./pages/AgentLogin";
import TicketControl from "./pages/TicketControl";
import { AgentSessionProvider } from "./contexts/AgentSessionContext";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AgentSessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/fidelite" element={<Fidelite />} />
            <Route path="/verification/:token" element={<TicketVerification />} />
            <Route path="/agent/connexion" element={<AgentLogin />} />
            <Route path="/controle-tickets" element={<TicketControl />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AgentSessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
