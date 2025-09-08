import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from '@/hooks/useAuth';
import { AppGate } from '@/components/auth/AppGate';
import AppLayout from '@/layouts/AppLayout';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Cobrancas from "./pages/Cobrancas";
import Passageiros from "./pages/Passageiros";
import Escolas from "./pages/Escolas";
import AdminDashboard from "./pages/admin/index";
import AdminSettings from "./pages/admin/settings";
import MotoristasAdmin from "./pages/admin/motoristas/index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <AuthProvider>
        <BrowserRouter>
          <AppGate>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<AppLayout />}>
                {/* Admin Routes */}
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/motoristas" element={<MotoristasAdmin />} />
                <Route path="admin/settings" element={<AdminSettings />} />
                
                {/* Motorista Routes */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="passageiros" element={<Passageiros />} />
                <Route path="mensalidades" element={<Cobrancas />} />
                <Route path="escolas" element={<Escolas />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppGate>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;