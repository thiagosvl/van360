import { TermosUsoDialog } from "@/components/features/register/TermosUsoDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RegisterFormData } from "@/schemas/registerSchema";
import { lazyLoad } from "@/utils/lazyLoad";
import { Loader2 } from "lucide-react";
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
  onNext: () => void;
}

export function RegistrationFormStep({
  form,
  loading,
  onNext,
}: RegistrationFormStepProps) {
  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              type="submit" 
              disabled={loading}
              className="w-full h-14 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>Criar minha conta</>
              )}
            </Button>
            <div className="mt-4 text-center">
              <TermosUsoDialog />
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
