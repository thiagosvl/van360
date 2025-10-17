import { AppGate } from "@/components/auth/AppGate";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { AuthProvider } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/layouts/AppLayout";
import { StatusBar, Style } from "@capacitor/status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSettings from "./pages/admin/Settings";
import UsuariosAdmin from "./pages/admin/Usuarios";
import Cobrancas from "./pages/Cobrancas";
import Configuracoes from "./pages/Configuracoes";
import Escolas from "./pages/Escolas";
import Gastos from "./pages/Gastos";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PassageiroCarteirinha from "./pages/PassageiroCarteirinha";
import PassageiroCobranca from "./pages/PassageiroCobranca";
import PassageiroExternalForm from "./pages/PassageiroExternalForm";
import Passageiros from "./pages/Passageiros";
import Relatorios from "./pages/Relatorios";

import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { Loader2 } from "lucide-react";
import BackButtonController from "./hooks/BackButtonController";

const queryClient = new QueryClient();

const App = () => {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: "#ffffff" });
    }
  }, []);

  useEffect(() => {
    const runUpdater = async () => {
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from("app_updates")
          .select("latest_version, url_zip, force_update")
          .eq("platform", Capacitor.getPlatform())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          console.warn("[OTA] Nenhuma atualização encontrada:", error?.message);
          return;
        }

        const { latest_version, url_zip, force_update } = data;
        const current = await CapacitorUpdater.current();
        const currentVersion =
          current?.bundle?.version || current?.native || "builtin";

        console.log("[OTA] Versão atual:", currentVersion);
        console.log("[OTA] Versão disponível:", latest_version);
        console.log("[OTA] Atualização obrigatória:", force_update);

        if (currentVersion === latest_version) {
          console.log("[OTA] Já está na versão mais recente:", currentVersion);
          return;
        }

        if (force_update) {
          alert(
            "Uma nova versão obrigatória do aplicativo está disponível.\nA atualização será iniciada agora."
          );

          setUpdating(true);
          setProgress(0);

          const listener = await CapacitorUpdater.addListener(
            "download",
            (info: any) => {
              if (info?.percent !== undefined)
                setProgress(Math.round(info.percent));
            }
          );

          try {
            const version = await CapacitorUpdater.download({
              version: latest_version,
              url: url_zip,
            });

            await listener.remove();
            await CapacitorUpdater.set(version);
            await CapacitorUpdater.reload();
          } catch (err) {
            console.error("[OTA] Erro ao aplicar atualização forçada:", err);
            setUpdating(false);
          }

          return;
        }

        try {
          toast({
            title: "Atualização disponível",
            description: "Baixando em segundo plano...",
          });

          const version = await CapacitorUpdater.download({
            version: latest_version,
            url: url_zip,
          });

          await CapacitorUpdater.next({ id: version.id });
          localStorage.setItem("pendingUpdate", version.id);

          toast({
            title: "Atualização baixada",
            description:
              "Ela será aplicada automaticamente quando o app for reiniciado.",
          });
        } catch (err) {
          console.error("[OTA] Erro em atualização silenciosa:", err);
        }
      } catch (err) {
        console.error("[OTA] Erro no processo OTA:", err);
      }
    };

    runUpdater();
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const notifyReady = async () => {
      try {
        const current = await CapacitorUpdater.current();
        const pending = localStorage.getItem("pendingUpdate");

        if (pending && pending === current?.bundle?.id) {
          localStorage.removeItem("pendingUpdate");
          console.log(`[OTA] Versão ${pending} agora ativa!`);
          toast({
            title: "Aplicativo atualizado",
            description: "A nova versão foi instalada com sucesso.",
          });
        }

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
            <BackButtonController />
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
              <Route path="/" element={<Navigate to="/inicio" replace />} />

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
                <Route path="inicio" element={<Inicio />} />
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
                <Route path="relatorios" element={<Relatorios />} />
                <Route path="configuracoes" element={<Configuracoes />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>

        {/* 🔹 Overlay de atualização forçada */}
        {updating && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 text-white">
            <Loader2 className="animate-spin w-10 h-10 mb-3" />
            <p className="text-lg font-medium mb-2">
              Atualizando o aplicativo...
            </p>
            <p className="text-sm opacity-80">{progress}% concluído</p>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
