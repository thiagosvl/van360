import { AppGate } from "@/components/auth/AppGate";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/layouts/AppLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSettings from "./pages/admin/Settings";
import UsuariosAdmin from "./pages/admin/Usuarios";
import Cobrancas from "./pages/Cobrancas";
import Configuracoes from "./pages/Configuracoes";
import Dashboard from "./pages/Dashboard";
import Escolas from "./pages/Escolas";
import Gastos from "./pages/Gastos";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PassageiroCarteirinha from "./pages/PassageiroCarteirinha";
import PassageiroCobranca from "./pages/PassageiroCobranca";
import Passageiros from "./pages/Passageiros";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <AuthProvider>
        <BrowserRouter>
        <ScrollToTop />
          <Routes>
            {/* <Route path="/"  element={<Index />} /> */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="/login"
              element={
                <AppGate>
                  <Login />
                </AppGate>
              }
            />

            {/* Protected routes */}
            <Route
              element={
                <AppGate>
                  <AppLayout />
                </AppGate>
              }
            >
              {/* Admin Routes */}
              <Route
                path="admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/usuarios" element={<UsuariosAdmin />} />
              <Route path="admin/configuracoes" element={<AdminSettings />} />

              {/* Motorista Routes */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="passageiros" element={<Passageiros />} />
              <Route
                path="passageiros/:passageiro_id"
                element={<PassageiroCarteirinha />}
              />
              <Route
                path="passageiros/:passageiro_id/mensalidade/:cobranca_id"
                element={<PassageiroCobranca />}
              />
              <Route path="mensalidades" element={<Cobrancas />} />
              <Route path="escolas" element={<Escolas />} />
              <Route path="gastos" element={<Gastos />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
