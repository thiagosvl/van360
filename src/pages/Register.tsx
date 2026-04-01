import { NativeWelcomeScreen } from "@/components/features/register/NativeWelcomeScreen";
import { PostRegisterScreen } from "@/components/features/register/PostRegisterScreen";
import { RegistrationFormStep } from "@/components/features/register/steps/RegistrationFormStep";
import { Button } from "@/components/ui/button";
import { useAnalyticsInjector } from "@/hooks/business/useAnalyticsInjector";
import { useRegisterController } from "@/hooks/register/useRegisterController";
import { useSEO } from "@/hooks/useSEO";
import { Wand2 } from "lucide-react";

export default function Register() {
  useSEO({
    title: "Criar conta grátis | Van360 — Você dirige. A gente organiza.",
    description: "Crie sua conta e organize passageiros, mensalidades, contratos e recibos da sua van escolar. 15 dias grátis, sem cartão.",
  });
  useAnalyticsInjector({ gtm: true, clarity: true });

  const {
    form,
    loading,
    handleNextStep,
    handleFillMagic,
    postRegisterData,
    handleContinueInBrowser,
    showNativeWelcome,
    duplicateError,
    clearDuplicateError,
  } = useRegisterController();

  // Tela de boas-vindas após primeiro cadastro no app nativo
  if (showNativeWelcome) {
    return <NativeWelcomeScreen />;
  }

  // Tela pós-cadastro condicional (somente web)
  if (postRegisterData) {
    return (
      <PostRegisterScreen
        data={postRegisterData}
        onContinueInBrowser={handleContinueInBrowser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-[max(1rem,var(--safe-area-top))] pb-[max(1rem,var(--safe-area-bottom))]">
      <div className="max-w-3xl w-full mx-auto space-y-8">

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

          {/* Progress Bar */}
          <div className="relative h-1.5 bg-gray-100 w-full font-bold">
            <div
              className="absolute top-0 left-0 h-full bg-[#1a3a5c] transition-all duration-500 ease-out rounded-r-full"
              style={{ width: `100%` }}
            />
          </div>

          {/* Header */}
          <div className="text-center p-6 pb-0 relative">
            {import.meta.env.DEV && (
              <div className="absolute right-2 top-2 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-full transition-all"
                  onClick={handleFillMagic}
                  title="Preencher com dados de teste"
                >
                  <Wand2 className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div>
              {/* Logo Section */}
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/assets/logo-van360.png"
                    alt="Van360"
                    className="h-12 w-auto select-none drop-shadow-sm"
                  />
                </div>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-4xl text-[#1a3a5c] drop-shadow-sm">
                Faça seu Cadastro
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <RegistrationFormStep
              form={form}
              loading={loading}
              onNext={async () => {
                await handleNextStep();
              }}
              duplicateError={duplicateError}
              onDismissDuplicateError={clearDuplicateError}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-sm text-slate-600 font-medium">
            © {new Date().getFullYear()} Van360. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
