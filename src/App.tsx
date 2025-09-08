import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SessionProvider } from "@/hooks/useSessionContext";
import { withMotoristaGuard } from "@/components/guards/withMotoristaGuard";
import { withAdminGuard } from "@/components/guards/withAdminGuard";
import Cobrancas from "./pages/Cobrancas";
import Dashboard from "./pages/Dashboard";
import Escolas from "./pages/Escolas";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Passageiros from "./pages/Passageiros";
import PassageiroCarteirinha from "./pages/PassageiroCarteirinha";
import Login from "./pages/login";
import AdminLayout from "./pages/admin/Layout";
import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/index";
import AdminSettings from "./pages/admin/settings";
import MotoristasAdmin from "./pages/admin/motoristas/index";

const queryClient = new QueryClient();

// Protected components
const ProtectedIndex = withMotoristaGuard(Index);
const ProtectedDashboard = withMotoristaGuard(Dashboard);
const ProtectedCobrancas = withMotoristaGuard(Cobrancas);
const ProtectedPassageiros = withMotoristaGuard(Passageiros);
const ProtectedPassageiroCarteirinha = withMotoristaGuard(PassageiroCarteirinha);
const ProtectedEscolas = withMotoristaGuard(Escolas);
const ProtectedAdminLayout = withAdminGuard(AdminLayout);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Motorista Protected Routes */}
            <Route path="/" element={<ProtectedIndex />} />
            <Route path="/dashboard" element={<ProtectedDashboard />} />
            <Route path="/mensalidades" element={<ProtectedCobrancas />} />
            <Route path="/passageiros" element={<ProtectedPassageiros />} />
            <Route path="/passageiros/:passageiro_id" element={<ProtectedPassageiroCarteirinha />} />
            <Route path="/escolas" element={<ProtectedEscolas />} />
            
            {/* Admin Protected Routes */}
            <Route path="/admin" element={<ProtectedAdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="motoristas" element={<MotoristasAdmin />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
