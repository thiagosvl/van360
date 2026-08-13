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
      toast.success("Dados cadastrais atualizados com sucesso!");
      onSuccess();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj.response?.data?.message || "Erro ao salvar dados cadastrais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={() => { }} lockClose={true}>
      <BaseDialog.Header
        title="Atualização Cadastral"
        icon={<UserCheck className="w-6 h-6 text-[#1a3a5c]" />}
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form id="form-dados-complementares" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <Banner
              variant="warning"
              description={
                <span>
                  Para prosseguir para a carteirinha do(a) <strong>{passageiroNome}</strong>, confirme ou preencha o <strong>CPF</strong> e <strong>E-mail</strong> do responsável.
                </span>
              }
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    CPF do Responsável
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IdCard className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="000.000.000-00"
                        onChange={(e) => field.onChange(cpfMask(e.target.value))}
                        className="pl-11 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 text-base font-semibold text-slate-700"
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    E-mail
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        className="pl-11 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 text-base font-semibold text-slate-700"
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
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
          className="w-full"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
};
