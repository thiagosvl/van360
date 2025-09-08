import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SessionProvider } from "@/hooks/useSessionContext";
import { withMotoristaGuard } from "@/components/guards/withMotoristaGuard";
import { withAdminGuard } from "@/components/guards/withAdminGuard";
import { MotoristaLayout } from "@/pages/motorista/Layout";
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
const ProtectedMotoristaLayout = withMotoristaGuard(MotoristaLayout);
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
            
            {/* Public Landing Page */}
            <Route index element={<Index />} />
            
            {/* Motorista Protected Routes with Layout */}
            <Route path="/" element={<ProtectedMotoristaLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="mensalidades" element={<Cobrancas />} />
              <Route path="passageiros" element={<Passageiros />} />
              <Route path="passageiros/:passageiro_id" element={<PassageiroCarteirinha />} />
              <Route path="escolas" element={<Escolas />} />
            </Route>
            
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
