import { DuplicateErrorBanner } from "@/components/features/register/DuplicateErrorBanner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DuplicateError } from "@/hooks/register/useRegisterController";
import { RegisterFormData } from "@/schemas/registerSchema";
import { CadastroForm } from "@/components/features/register";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { TermosUsoDialog as TermosDialog } from "@/components/dialogs/TermosUsoDialog";
import { PoliticaPrivacidadeDialog } from "@/components/dialogs/PoliticaPrivacidadeDialog";

interface RegistrationFormStepProps {
  form: UseFormReturn<RegisterFormData>;
  loading: boolean;
  onNext: () => void;
  duplicateError?: DuplicateError | null;
  onDismissDuplicateError?: () => void;
}

export function RegistrationFormStep({
  form,
  loading,
  onNext,
  duplicateError,
  onDismissDuplicateError,
}: RegistrationFormStepProps) {
  const [openTermos, setOpenTermos] = useState(false);
  const [openPolitica, setOpenPolitica] = useState(false);

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
            {duplicateError && onDismissDuplicateError && (
              <DuplicateErrorBanner
                error={duplicateError}
                onDismiss={onDismissDuplicateError}
              />
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-[15px] font-semibold bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-md transition-all"
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
              <div className="px-4 pt-2 pb-0 text-center text-xs sm:text-sm text-slate-500 leading-relaxed">
                <span>Ao criar sua conta, você concorda com nossos </span>
                <button
                  type="button"
                  onClick={() => setOpenTermos(true)}
                  className="font-bold text-[#1a3a5c] hover:text-[#f59e0b] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-sm px-0.5 inline-flex items-center"
                >
                  Termos de Uso
                </button>
                <span> e </span>
                <button
                  type="button"
                  onClick={() => setOpenPolitica(true)}
                  className="font-bold text-[#1a3a5c] hover:text-[#f59e0b] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-sm px-0.5 inline-flex items-center"
                >
                  Política de Privacidade
                </button>

                <TermosDialog open={openTermos} onOpenChange={setOpenTermos} />
                <PoliticaPrivacidadeDialog open={openPolitica} onOpenChange={setOpenPolitica} />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
