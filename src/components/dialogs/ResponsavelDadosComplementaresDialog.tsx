import React from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cpfMask } from "@/utils/masks";
import { Mail, UserCheck, IdCard } from "lucide-react";
import { responsavelApi } from "@/services/api/responsavel.api";
import { toast } from "sonner";
import { cpfCnpjSchema } from "@/schemas/common";

const complementaresSchema = z.object({
  cpf: cpfCnpjSchema,
  email: z.string().min(1, "E-mail é obrigatório").email("Digite um endereço de e-mail válido.")
});

type ComplementaresFormValues = z.infer<typeof complementaresSchema>;

interface ResponsavelDadosComplementaresDialogProps {
  open: boolean;
  passageiroId: string;
  passageiroNome: string;
  initialCpf?: string;
  initialEmail?: string;
  token: string;
  onSuccess: () => void;
}

export const ResponsavelDadosComplementaresDialog: React.FC<ResponsavelDadosComplementaresDialogProps> = ({
  open,
  passageiroId,
  passageiroNome,
  initialCpf = "",
  initialEmail = "",
  token,
  onSuccess
}) => {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<ComplementaresFormValues>({
    resolver: zodResolver(complementaresSchema),
    defaultValues: {
      cpf: initialCpf ? cpfMask(initialCpf) : "",
      email: initialEmail || ""
    }
  });

  React.useEffect(() => {
    if (open) {
      setLoading(false);
      form.reset({
        cpf: initialCpf ? cpfMask(initialCpf) : "",
        email: initialEmail || ""
      });
    }
  }, [open, initialCpf, initialEmail, form]);

  const handleSubmit = async (values: ComplementaresFormValues) => {
    const cleanCpf = values.cpf.replace(/\D/g, "");
    setLoading(true);

    try {
      await responsavelApi.updateDadosComplementares(
        passageiroId,
        token,
        cleanCpf,
        values.email
      );
      onSuccess();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj.response?.data?.message || "Erro ao salvar dados cadastrais.");
      setLoading(false);
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={() => { }} lockClose={true}>
      <BaseDialog.Header
        title="Atualização Cadastral"
        icon={<UserCheck className="w-5 h-5" />}
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form id="form-dados-complementares" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2 text-left">
            <Banner
              variant="info"
              description={
                <span>
                  Para prosseguir para a carteirinha do(a) <strong>{passageiroNome}</strong>, confirme ou preencha os <strong>seus dados pessoais (CPF e E-mail)</strong>.
                </span>
              }
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Seu CPF <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IdCard className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="000.000.000-00"
                        onChange={(e) => field.onChange(cpfMask(e.target.value))}
                        className="pl-12 h-12 text-base rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 text-slate-700 font-medium"
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 font-medium ml-1 mt-1.5" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Seu E-mail <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        className="pl-12 h-12 text-base rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 text-slate-700 font-medium"
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 font-medium ml-1 mt-1.5" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Salvar e Continuar"
          variant="primary"
          form="form-dados-complementares"
          type="submit"
          isLoading={loading}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
};
