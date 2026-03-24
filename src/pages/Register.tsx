import { RegistrationFormStep } from "@/components/features/register/steps/RegistrationFormStep";
import { Button } from "@/components/ui/button";
import { useRegisterController } from "@/hooks/register/useRegisterController";
import { useSEO } from "@/hooks/useSEO";
import { Wand2 } from "lucide-react";

export default function Register() {
  useSEO({
    title: "Cadastro | Van360",
    description: "Crie sua conta no Van360 e comece a gerenciar seu transporte escolar.",
  });

  const {
    form,
    loading,
    handleNextStep,
    handleFillMagic,
  } = useRegisterController();

  const finalStep = 1;
  const WandIcon = Wand2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#60a5fa] to-[#dbeafe] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl w-full mx-auto space-y-8">

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Progress Bar */}
          <div className="relative h-1.5 bg-gray-100 w-full">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500 ease-out rounded-r-full"
              style={{ width: `100%` }}
            />
          </div>
        
        {/* Header */}
        <div className="text-center space-y-2 p-6 pb-0 relative">
          <div className="absolute right-0 sm:right-6 top-10 z-20">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              onClick={handleFillMagic}
              title="Preencher com dados de teste"
            >
              <WandIcon className="h-5 w-5" />
            </Button>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl drop-shadow-sm">
            Crie sua conta
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mx-auto">
            Preencha seus dados para acessar o sistema completo.
          </p>
        </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <RegistrationFormStep
              form={form}
              loading={loading}
              onNext={async () => {
                  await handleNextStep();
              }}
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
