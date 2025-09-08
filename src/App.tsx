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
import AdminLayout from "./pages/admin/Layout";
import AdminDashboard from "./pages/admin/index";
import AdminSettings from "./pages/admin/settings";
import MotoristasAdmin from "./pages/admin/motoristas/index";

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
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="motoristas" element={<MotoristasAdmin />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
