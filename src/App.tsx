import { AppGate } from "@/components/auth/AppGate";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/layouts/AppLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
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
import PassageiroExternalForm from "./pages/PassageiroExternalForm";
import Passageiros from "./pages/Passageiros";

import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";

const queryClient = new QueryClient();

const App = () => {
   useEffect(() => {
    const runUpdater = async () => {
      console.log("[OTA] Iniciando verificação de ambiente...");
      if (!Capacitor.isNativePlatform()) {
        console.log("[OTA] Ambiente web detectado — atualização ignorada.");
        return;
      }

      try {
        console.log("[OTA] Chamando notifyAppReady...");
        await CapacitorUpdater.notifyAppReady();
        console.log("[OTA] notifyAppReady confirmado com sucesso.");

        console.log("[OTA] Iniciando download do pacote...");
        const version = await CapacitorUpdater.download({
          version: "1.0.2",
          url: "https://scxjzvblqnamfvasjaug.supabase.co/storage/v1/object/public/ota/app-v1.0.2.zip",
        });
        console.log("[OTA] Download concluído:", version);

        console.log("[OTA] Aplicando nova versão...");
        await CapacitorUpdater.set(version);
        console.log("[OTA] Atualização aplicada com sucesso.");
      } catch (err) {
        console.error("[OTA] Erro no processo OTA:", err);
      }
    };

    runUpdater();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Rotas Públicas */}
              <Route
                path="/login"
                element={
                  <AppGate>
                    <Login />
                  </AppGate>
                }
              />
              {/* Rota Pública de pré-cadastro */}
              <Route
                path="/cadastro-passageiro/:motoristaId"
                element={<PassageiroExternalForm />}
              />

              {/* Redirecionamento padrão */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Rotas Protegidas */}
              <Route
                element={
                  <AppGate>
                    <AppLayout />
                  </AppGate>
                }
              >
                {/* Admin */}
                <Route
                  path="admin"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/usuarios" element={<UsuariosAdmin />} />
                <Route path="admin/configuracoes" element={<AdminSettings />} />

                {/* Motorista */}
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
};

export default App;
