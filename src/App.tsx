import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Cobrancas from "./pages/Cobrancas";
import Dashboard from "./pages/Dashboard";
import Escolas from "./pages/Escolas";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Passageiros from "./pages/Passageiros";
import PassageiroCarteirinha from "./pages/PassageiroCarteirinha";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mensalidades" element={<Cobrancas />} />
          <Route path="/passageiros" element={<Passageiros />} />
          <Route path="/passageiros/:passageiro_id" element={<PassageiroCarteirinha />} />
          <Route path="/escolas" element={<Escolas />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
