import { TermosUsoDialog } from "@/components/features/register/TermosUsoDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PLANO_ESSENCIAL } from "@/constants";
import { RegisterFormData } from "@/schemas/registerSchema";
import { Plano } from "@/types/plano";
import { lazyLoad } from "@/utils/lazyLoad";
import { FileText, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

// Lazy load
const CadastroForm = lazyLoad(() =>
  import("@/components/features/register").then((mod) => ({
    default: mod.CadastroForm,
  }))
);

interface RegistrationFormStepProps {
  form: UseFormReturn<RegisterFormData>;
  loading: boolean;
  selectedPlano?: Plano;
  requiresPayment: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function RegistrationFormStep({
  form,
  loading,
  selectedPlano,
  requiresPayment,
  onBack,
  onNext,
}: RegistrationFormStepProps) {
  const getButtonConfig = () => {
    if (requiresPayment) {
      return {
        text: "Ir para pagamento",
      };
    }



    if (selectedPlano?.slug === PLANO_ESSENCIAL) {
      return {
        text: "Iniciar teste grátis",
      };
    }

    return {
      text: "Confirmar",
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="h-9.5 w-9.5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-[0.92rem] font-semibold text-blue-900">
              Você escolheu: {selectedPlano?.nome}
            </h4>
            <p className="text-sm mt-1 sm:mt-0 text-blue-700">
              {selectedPlano?.descricao_curta}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-100 w-full sm:w-auto mt-2 sm:mt-0"
        >
          Alterar
        </Button>
      </div>

      <Form {...form}>
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            onNext();
          }}
        >
          <CadastroForm form={form} />

          <div className="pt-4">
            <Button
              type="submit" // Trigger onSubmit form
              disabled={loading}
              className="w-full h-14 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>{buttonConfig.text}</>
              )}
            </Button>
            <div className="mt-4">
              <TermosUsoDialog />
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
