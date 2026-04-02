import { DuplicateErrorBanner } from "@/components/features/register/DuplicateErrorBanner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DuplicateError } from "@/hooks/register/useRegisterController";
import { RegisterFormData } from "@/schemas/registerSchema";
import { CadastroForm } from "@/components/features/register";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

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

          <div className="pt-4 space-y-4">
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
          </div>
        </form>
      </Form>
    </section>
  );
}
