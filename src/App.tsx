import { AppGate } from "@/components/auth/AppGate";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import AppLayout from "@/layouts/AppLayout";
import { apiClient } from "@/services/api/client";
import { toast } from "@/utils/notifications/toast";
import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ResponsavelGate from "./components/auth/ResponsavelGate";
import BackButtonController from "./components/navigation/BackButtonController";
import ScrollToTop from "./components/navigation/ScrollToTop";
import ResponsavelLayout from "./layouts/ResponsavelLayout";

import { lazyLoad } from "@/utils/lazyLoad";

// Lazy loading de rotas principais
const Login = lazyLoad(() => import("./pages/Login"));
const Register = lazyLoad(() => import("./pages/Register"));
const NovaSenha = lazyLoad(() => import("./pages/NovaSenha"));
const Index = lazyLoad(() => import("./pages/lp/Index"));
const Home = lazyLoad(() => import("./pages/Home"));

const Assinatura = lazyLoad(() => import("./pages/Assinatura"));
const Passageiros = lazyLoad(() => import("./pages/Passageiros"));
const PassageiroCarteirinha = lazyLoad(() => import("./pages/PassageiroCarteirinha"));
const PassageiroCobranca = lazyLoad(() => import("./pages/PassageiroCobranca"));
const PassageiroExternalForm = lazyLoad(() => import("./pages/PassageiroExternalForm"));
const AssinarContrato = lazyLoad(() => import("./pages/AssinarContrato"));
const Cobrancas = lazyLoad(() => import("./pages/Cobrancas"));
const Escolas = lazyLoad(() => import("./pages/Escolas"));
const Veiculos = lazyLoad(() => import("./pages/Veiculos"));
const Gastos = lazyLoad(() => import("./pages/Gastos"));
const Relatorios = lazyLoad(() => import("./pages/Relatorios"));
const Contratos = lazyLoad(() => import("./pages/Contratos"));
const NotFound = lazyLoad(() => import("./pages/NotFound"));

import { queryClient } from "@/services/queryClient";

const App = () => {
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    latest_version: string;
    url_zip: string;
  } | null>(null);

  useEffect(() => {
    const runUpdater = async () => {
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      try {
        const { data } = await apiClient.get("/app/updates", {
            params: { platform: Capacitor.getPlatform() }
        });

        if (!data) {
          // Nenhuma atualização OTA encontrada
          return;
        }

        const { latest_version, url_zip, force_update } = data;
        const current = await CapacitorUpdater.current();
        const currentVersion =
          current?.bundle?.version || current?.native || "builtin";

        if (currentVersion === latest_version) {
          // Já está na versão mais recente
          return;
        }

        if (force_update) {
          // Mostrar dialog de confirmação primeiro
          setPendingUpdate({ latest_version, url_zip });
          setShowUpdateDialog(true);
          return;
        }

        try {
                toast.info("sistema.info.atualizacaoApp", {
                  description: "sistema.info.atualizacaoAppDescricao",
                });

          const version = await CapacitorUpdater.download({
            version: latest_version,
            url: url_zip,
          });

          await CapacitorUpdater.next({ id: version.id });
          localStorage.setItem("pendingUpdate", version.id);

                  toast.success("sistema.info.melhoriasProntas", {
                    description: "sistema.info.melhoriasProntasDescricao",
                  });
        } catch (err) {
          // Erro em atualização silenciosa - não crítico
        }
      } catch (err) {
        // Erro no processo OTA - não crítico
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
          toast.success("sistema.info.appAtualizado", {
            description: "sistema.info.appAtualizadoDescricao",
          });
        }

        await CapacitorUpdater.notifyAppReady();
      } catch (err) {
        // Erro ao enviar notifyAppReady - não crítico
      }
    };

    notifyReady();
  }, []);

  // Componente de loading para Suspense
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <AppErrorBoundary>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <BackButtonController />
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
            {/* Rotas Públicas */}
            <Route
              path={ROUTES.PUBLIC.LOGIN}
              element={
                <AppGate>
                  <Login />
                </AppGate>
              }
            />

            <Route
              path={ROUTES.PUBLIC.REGISTER}
              element={
                <AppGate>
                  <Register />
                </AppGate>
              }
            />

            <Route
              path={ROUTES.PUBLIC.NEW_PASSWORD}
              element={
                <AppGate>
                  <NovaSenha />
                </AppGate>
              }
            />

            {/* Rota Pública de pré-cadastro */}
            <Route
              path={ROUTES.PUBLIC.EXTERNAL_PASSENGER_FORM}
              element={<PassageiroExternalForm />}
            />

            {/* Rota Pública de assinatura de contrato */}
            <Route
              path="/assinar/:token"
              element={<AssinarContrato />}
            />

            <Route
              path={ROUTES.PUBLIC.ROOT}
              element={
                Capacitor.isNativePlatform() ? (
                  // App nativo → vai direto para login
                  <Navigate to={ROUTES.PUBLIC.LOGIN} replace />
                ) : (
                  // Web → mostra página inicial pública
                  <Index />
                )
              }
            />

            {/* Rota Visão Responsável */}
            <Route
              path={ROUTES.PRIVATE.RESPONSAVEL.ROOT}
              element={
                <ResponsavelGate>
                  <ResponsavelLayout />
                </ResponsavelGate>
              }
            />

            {/* Rotas Protegidas */}
            <Route
              element={
                <AppGate>
                  <AppLayout />
                </AppGate>
              }
            >

              {/* Motorista */}
              <Route path={ROUTES.PRIVATE.MOTORISTA.HOME} element={<Home />} />
              <Route path={ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION} element={<Assinatura />} />
              <Route path={ROUTES.PRIVATE.MOTORISTA.PASSENGERS} element={<Passageiros />} />
              <Route
                path={ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS}
                element={<PassageiroCarteirinha />}
              />
              <Route
                path={ROUTES.PRIVATE.MOTORISTA.PASSENGER_BILLING}
                element={<PassageiroCobranca />}
              />
              <Route path={ROUTES.PRIVATE.MOTORISTA.BILLING} element={<Cobrancas />} />
              <Route path={ROUTES.PRIVATE.MOTORISTA.SCHOOLS} element={<Escolas />} />
              <Route path={ROUTES.PRIVATE.MOTORISTA.VEHICLES} element={<Veiculos />} />
              <Route path={ROUTES.PRIVATE.MOTORISTA.EXPENSES} element={<Gastos />} />
              <Route path={ROUTES.PRIVATE.MOTORISTA.REPORTS} element={<Relatorios />} />
              <Route path={ROUTES.PRIVATE.MOTORISTA.CONTRACTS} element={<Contratos />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </BrowserRouter>
        </AppErrorBoundary>

        {/* 🔹 Dialog de confirmação de atualização */}
        <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">
                Nova versão disponível
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base pt-2">
                Uma nova versão do aplicativo está disponível. O aplicativo será
                atualizado agora para garantir o melhor funcionamento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-end">
              <AlertDialogAction
                onClick={async () => {
                  setShowUpdateDialog(false);
                  if (!pendingUpdate) return;

                  setUpdating(true);
                  setProgress(0);

                  try {
                    const listener = await CapacitorUpdater.addListener(
                      "download",
                      (info: any) => {
                        if (info?.percent !== undefined)
                          setProgress(Math.round(info.percent));
                      }
                    );

                    const version = await CapacitorUpdater.download({
                      version: pendingUpdate.latest_version,
                      url: pendingUpdate.url_zip,
                    });

                    await listener.remove();
                    await CapacitorUpdater.set(version);
                    await CapacitorUpdater.reload();
                  } catch (err) {
                    setUpdating(false);
                    setPendingUpdate(null);
                    toast.error("sistema.erro.atualizacao", {
                      description:
                        "Não foi possível aplicar a atualização. Tente novamente.",
                    });
                  }
                }}
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default App;
