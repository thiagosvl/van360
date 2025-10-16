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
      if (!Capacitor.isNativePlatform()) {
        console.log("[OTA] Ignorado — ambiente web");
        return;
      }

      const targetVersion = "1.0.1";
      const targetUrl = `https://scxjzvblqnamfvasjaug.supabase.co/storage/v1/object/public/ota/app-v${targetVersion}.zip`;

      try {
        const current = await CapacitorUpdater.current();
        const currentVersion = current?.bundle?.version || current?.native;

        console.log("[OTA] Versão atual:", currentVersion);

        // evita download se o app embutido já for equivalente
        if (currentVersion === targetVersion || currentVersion === "builtin") {
          console.log(
            "[OTA] Já está na versão mais recente ou é a versão base."
          );
          return;
        }

        console.log("[OTA] Iniciando atualização OTA...");
        const version = await CapacitorUpdater.download({
          version: targetVersion,
          url: targetUrl,
        });

        console.log("[OTA] Download concluído:", version);
        await CapacitorUpdater.set(version);
        console.log("[OTA] Atualização aplicada com sucesso.");
      } catch (err) {
        console.error("[OTA] Erro no processo OTA:", err);
      }
    };

    runUpdater();
  }, []);

  useEffect(() => {
    const notifyReady = async () => {
      try {
        await CapacitorUpdater.notifyAppReady();
        console.log("[OTA] notifyAppReady enviado com sucesso.");
      } catch (err) {
        console.error("[OTA] Erro ao enviar notifyAppReady:", err);
      }
    };
    notifyReady();
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
