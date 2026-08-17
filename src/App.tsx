import { AppGate } from "@/components/auth/AppGate";
import { InitialLoading } from "@/components/auth/InitialLoading";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import { AdminLayout } from "@/layouts/AdminLayout";
import AppLayout from "@/layouts/AppLayout";
import { usePushNotifications } from "@/hooks/ui/usePushNotifications";
import { apiClient } from "@/services/api/client";
import { queryClient } from "@/services/queryClient";
import { UserType } from "@/types/enums";
import { isDevEnv } from "@/utils/detectPlatform";
import { lazyLoad } from "@/utils/lazyLoad";
import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router-dom";

import BackButtonController from "./components/navigation/BackButtonController";
import ScrollToTop from "./components/navigation/ScrollToTop";

import { LayoutProvider } from "@/contexts/LayoutProvider";

const PushNotificationController = () => {
  usePushNotifications();
  return null;
};

import { ResponsavelAuthProvider } from "@/contexts/ResponsavelAuthContext";
import { ResponsavelProtectedRoute } from "@/components/routes/ResponsavelProtectedRoute";

const ResponsavelSelecionarPassageiro = lazyLoad(() => import("./pages/ResponsavelSelecionarPassageiro").then(m => ({ default: m.ResponsavelSelecionarPassageiro })));
const ResponsavelCarteirinhaBase = lazyLoad(() => import("./pages/ResponsavelCarteirinhaBase").then(m => ({ default: m.ResponsavelCarteirinhaBase })));

const Login = lazyLoad(() => import("./pages/Login"));
const Register = lazyLoad(() => import("./pages/Register"));
const Splash = lazyLoad(() => import("./pages/Splash"));
const Home = lazyLoad(() => import("./pages/Home"));

const Passageiros = lazyLoad(() => import("./pages/Passageiros"));
const PassageiroCarteirinha = lazyLoad(() => import("./pages/PassageiroCarteirinha"));
const PassageiroExternalForm = lazyLoad(() => import("./pages/PassageiroExternalForm"));
const AssinarContrato = lazyLoad(() => import("./pages/AssinarContrato"));
const Cobrancas = lazyLoad(() => import("./pages/Cobrancas"));
const Escolas = lazyLoad(() => import("./pages/Escolas"));
const Veiculos = lazyLoad(() => import("./pages/Veiculos"));
const Gastos = lazyLoad(() => import("./pages/Gastos"));
const Relatorios = lazyLoad(() => import("./pages/Relatorios"));
const Configuracoes = lazyLoad(() => import("./pages/Configuracoes"));
const Contratos = lazyLoad(() => import("./pages/Contratos"));
const Rotas = lazyLoad(() => import("./pages/Rotas"));
const MinhaEquipe = lazyLoad(() => import("./pages/MinhaEquipe"));
const ConfigurarRota = lazyLoad(() => import("./pages/ConfigurarRota"));
const RouteExecutionPage = lazyLoad(() => import("./pages/RouteExecutionPage"));
const RouteDetailsPage = lazyLoad(() => import("./pages/RouteDetailsPage"));
const Aniversariantes = lazyLoad(() => import("./pages/Aniversariantes"));
const Subscription = lazyLoad(() => import("./pages/subscription/SubscriptionPage"));
const ExternalCheckoutBridge = lazyLoad(() => import("./pages/subscription/ExternalCheckoutBridge"));
const PrivacyPolicy = lazyLoad(() => import("./pages/legal/PrivacyPolicyPage"));
const TermsOfUse = lazyLoad(() => import("./pages/legal/TermsOfUsePage"));
const NotFound = lazyLoad(() => import("./pages/NotFound"));

const AdminDashboard = lazyLoad(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazyLoad(() => import("./pages/admin/AdminUsers"));
const AdminUserDetails = lazyLoad(() => import("./pages/admin/AdminUserDetails"));
const AdminSettings = lazyLoad(() => import("./pages/admin/AdminSettings"));
const AdminCalculator = lazyLoad(() => import("./pages/admin/AdminCalculator"));
const AdminLoginAttempts = lazyLoad(() => import("./pages/admin/AdminLoginAttempts"));
const AdminActivityHistory = lazyLoad(() => import("./pages/admin/AdminActivityHistory"));
const AdminEvolutionInstances = lazyLoad(() => import("./pages/admin/AdminEvolutionInstances"));
const AdminBlogPage = lazyLoad(() => import("./pages/admin/AdminBlogPage"));

const App = () => {
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const runUpdater = async () => {
      if (!Capacitor.isNativePlatform()) return;
      if (isDevEnv()) return;

      try {
        const current = await CapacitorUpdater.current();
        const currentVersion =
          current?.bundle?.version || current?.native || "builtin";

        const { data } = await apiClient.get("/app/updates", {
          params: {
            platform: Capacitor.getPlatform(),
            current_version: currentVersion,
          },
        });

        if (!data) return;

        const { latest_version, url_zip, force_update } = data;

        if (currentVersion === latest_version) return;

        const pendingUpdateId = localStorage.getItem("pendingUpdate");
        if (pendingUpdateId && pendingUpdateId === latest_version && !force_update) {
          return;
        }

        if (force_update) {
          setUpdating(true);
          setProgress(0);

          const performForceUpdate = async () => {
            let listener: unknown = null;
            try {
              listener = await CapacitorUpdater.addListener(
                "download",
                (info: { percent?: number }) => {
                  if (info?.percent !== undefined) {
                    setProgress(Math.round(info.percent));
                  }
                }
              );

              const version = await CapacitorUpdater.download({
                version: latest_version,
                url: url_zip,
              });

              if (listener && typeof (listener as { remove: () => Promise<void> }).remove === "function") {
                await (listener as { remove: () => Promise<void> }).remove();
              }

              await CapacitorUpdater.set(version);
              await CapacitorUpdater.reload();
            } catch (err) {
              if (listener && typeof (listener as { remove: () => Promise<void> }).remove === "function") {
                try {
                  await (listener as { remove: () => Promise<void> }).remove();
                } catch { }
              }
              throw err;
            }
          };

          const TIMEOUT_MS = 7000;
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("OTA timeout limit exceeded")), TIMEOUT_MS);
          });

          try {
            await Promise.race([performForceUpdate(), timeoutPromise]);
          } catch (err) {
            setUpdating(false);
          }
          return;
        }

        try {
          const version = await CapacitorUpdater.download({
            version: latest_version,
            url: url_zip,
          });

          await CapacitorUpdater.next({ id: version.id });
          localStorage.setItem("pendingUpdate", version.id);
        } catch (err) {
        }
      } catch (err) {
      }
    };

    runUpdater();
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      document.body.classList.remove("native-app");
      return;
    }

    document.body.classList.add("native-app");

    const injectSafeAreas = () => {
      const testDiv = document.createElement("div");
      testDiv.style.paddingTop = "env(safe-area-inset-top)";
      testDiv.style.position = "absolute";
      testDiv.style.visibility = "hidden";
      document.body.appendChild(testDiv);

      const computedStyle = window.getComputedStyle(testDiv);
      const topInset = parseInt(computedStyle.paddingTop, 10) || 0;
      document.body.removeChild(testDiv);

      if (topInset === 0 && Capacitor.getPlatform() === "android") {
        const root = document.documentElement;

        root.style.setProperty("--safe-area-top", "24px");
        root.style.setProperty("--safe-area-bottom", "24px");
      }
    };

    setTimeout(injectSafeAreas, 500);
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
        }

        await CapacitorUpdater.notifyAppReady();
      } catch (err) {
      }
    };

    notifyReady();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ResponsavelAuthProvider>
            <LayoutProvider>
              <AppErrorBoundary>
                <BackButtonController />
                <PushNotificationController />
                <ScrollToTop />
                <Suspense fallback={<InitialLoading />}>
                  <Routes>
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
                      path={ROUTES.PUBLIC.EXTERNAL_PASSENGER_FORM}
                      element={<PassageiroExternalForm />}
                    />

                    <Route
                      path={ROUTES.PUBLIC.PRIVACY_POLICY}
                      element={<PrivacyPolicy />}
                    />

                    <Route
                      path={ROUTES.PUBLIC.TERMS_OF_USE}
                      element={<TermsOfUse />}
                    />

                    <Route
                      path={ROUTES.PUBLIC.EXTERNAL_CHECKOUT_BRIDGE}
                      element={<ExternalCheckoutBridge />}
                    />

                    <Route
                      path="/assinar/:token"
                      element={<AssinarContrato />}
                    />

                    <Route
                      path={ROUTES.PUBLIC.SPLASH}
                      element={
                        <AppGate>
                          <Splash />
                        </AppGate>
                      }
                    />

                    <Route
                      path={ROUTES.PUBLIC.ROOT}
                      element={
                        Capacitor.isNativePlatform() ? (
                          <Navigate to={ROUTES.PUBLIC.SPLASH} replace />
                        ) : (
                          <Navigate to={ROUTES.PUBLIC.LOGIN} replace />
                        )
                      }
                    />

                    <Route
                      element={
                        <AppGate>
                          <RoleProtectedRoute allowedRoles={[UserType.ADMIN]}>
                            <AdminLayout>
                              <Outlet />
                            </AdminLayout>
                          </RoleProtectedRoute>
                        </AppGate>
                      }
                    >
                      <Route path="/admin" element={<Navigate to={ROUTES.PRIVATE.ADMIN.DASHBOARD} replace />} />
                      <Route path={ROUTES.PRIVATE.ADMIN.DASHBOARD} element={<AdminDashboard />} />
                      <Route path={ROUTES.PRIVATE.ADMIN.USERS} element={<AdminUsers />} />
                      <Route path={ROUTES.PRIVATE.ADMIN.USER_DETAILS} element={<AdminUserDetails />} />
                      <Route path={ROUTES.PRIVATE.ADMIN.SETTINGS} element={<AdminSettings />} />
                      <Route path={ROUTES.PRIVATE.ADMIN.CALCULATOR} element={<AdminCalculator />} />
                      <Route path={ROUTES.PRIVATE.ADMIN.LOGIN_ATTEMPTS} element={<AdminLoginAttempts />} />
                      <Route path={ROUTES.PRIVATE.ADMIN.ACTIVITY_HISTORY} element={<AdminActivityHistory />} />
                      <Route path={ROUTES.PRIVATE.ADMIN.EVOLUTION_INSTANCES} element={<AdminEvolutionInstances />} />
                      <Route path={ROUTES.PRIVATE.ADMIN.BLOG} element={<AdminBlogPage />} />
                    </Route>

                    <Route
                      element={
                        <AppGate>
                          <RoleProtectedRoute allowedRoles={[UserType.MOTORISTA, UserType.MOTORISTA_AUXILIAR, UserType.MONITOR]}>
                            <AppLayout />
                          </RoleProtectedRoute>
                        </AppGate>
                      }
                    >
                      <Route path={ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION} element={<Subscription />} />

                      <Route element={<SubscriptionGuard><Outlet /></SubscriptionGuard>}>
                        <Route path={ROUTES.PRIVATE.MOTORISTA.HOME} element={<Home />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.PASSENGERS} element={<Passageiros />} />
                        <Route
                          path={ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS}
                          element={<PassageiroCarteirinha />}
                        />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.BILLING} element={<Cobrancas />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.SCHOOLS} element={<Escolas />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.VEHICLES} element={<Veiculos />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.EXPENSES} element={<Gastos />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.REPORTS} element={<Relatorios />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.SETTINGS} element={<Configuracoes />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.CONTRACTS} element={<Contratos />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.ROUTES} element={<Rotas />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.TEAM} element={<MinhaEquipe />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.ROUTE_SETUP} element={<ConfigurarRota />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.ROUTE_EDIT} element={<ConfigurarRota />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE} element={<RouteExecutionPage />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.ROUTE_DETAILS} element={<RouteDetailsPage />} />
                        <Route path={ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS} element={<Aniversariantes />} />
                      </Route>
                    </Route>

                    {/* Rotas do Responsavel */}
                    <Route
                      path={ROUTES.PRIVATE.RESPONSAVEL.SELECT}
                      element={
                        <ResponsavelProtectedRoute>
                          <ResponsavelSelecionarPassageiro />
                        </ResponsavelProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTES.PRIVATE.RESPONSAVEL.HOME}
                      element={
                        <ResponsavelProtectedRoute>
                          <ResponsavelCarteirinhaBase />
                        </ResponsavelProtectedRoute>
                      }
                    />

                    <Route path="/" element={<Navigate to={ROUTES.PUBLIC.LOGIN} replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AppErrorBoundary>
            </LayoutProvider>
          </ResponsavelAuthProvider>
        </BrowserRouter>

        {updating && (
          <div className="fixed inset-0 z-[9999]">
            <InitialLoading
              message={
                progress > 0
                  ? `Atualizando aplicativo (${progress}%)...`
                  : "Atualizando aplicativo..."
              }
            />
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
