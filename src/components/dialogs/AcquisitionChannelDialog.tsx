import { BaseDialog } from "@/components/ui/BaseDialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/hooks/business/useSession";
import { CanalAquisicao } from "@/types/enums";
import { CanalAquisicaoLabels } from "@/utils/acquisition-channel.utils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usuarioApi } from "@/services/api/usuario.api";
import { useProfile } from "@/hooks/business/useProfile";

interface AcquisitionChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  canal_aquisicao: z.nativeEnum(CanalAquisicao, {
    required_error: "Por favor, selecione uma opção.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function AcquisitionChannelDialog({ isOpen, onClose }: AcquisitionChannelDialogProps) {
  const { user } = useSession();
  const { profile, refreshProfile } = useProfile(user?.id);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = async (data: FormData) => {
    try {
      if (!profile?.id) return;
      await usuarioApi.atualizarCanalAquisicao(profile.id, data.canal_aquisicao);
      toast.success("Obrigado por responder!", {
        description: "Sua resposta nos ajuda a melhorar.",
      });
      await refreshProfile();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao salvar a resposta.";
      toast.error("Erro ao salvar", { description: errorMessage });
    }
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  // Previne fechar no esc ou clique fora, conforme combinado (obrigatório).
  const handleOpenChange = (open: boolean) => {
    if (!open) return; // Não permite fechar alterando o estado para false via background ou ESC
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={handleOpenChange} lockClose>
      <BaseDialog.Header
        title="Como você conheceu o Van360?"
        icon={<Megaphone className="w-5 h-5" />}
      // onClose={onClose} // Removido para não ter botão de fechar (X)
      />
      <BaseDialog.Body>
        <div className="mb-6 mt-2 text-sm text-slate-600">
          Obrigado por se juntar a nós! Para nos ajudar a melhorar, conta pra gente rapidinho: como você conheceu o aplicativo?
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, onFormError)} className="space-y-6">
            <FormField
              control={form.control}
              name="canal_aquisicao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Selecione uma opção <span className="text-red-600">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Escolha uma opção..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CanalAquisicaoLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Salvar"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={form.formState.isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
