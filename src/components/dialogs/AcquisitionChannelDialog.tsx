import { BaseDialog } from "@/components/ui/BaseDialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/hooks/business/useSession";
import { CanalAquisicao } from "@/types/enums";
import { CanalAquisicaoLabels, CANAL_AQUISICAO_ORDERED_OPTIONS } from "@/utils/acquisition-channel.utils";
import { isMotoristaTitular } from "@/utils/userUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usuarioApi } from "@/services/api/usuario.api";
import { useProfile } from "@/hooks/business/useProfile";
import { safeCloseDialog } from "@/hooks";
import { STORAGE_KEYS } from "@/constants";

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

  const isTitular = isMotoristaTitular(profile);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleDismiss = () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.ACQUISITION_CHANNEL_DISMISSED_DATE, today);
    } catch {
      // noop
    }
    safeCloseDialog(onClose);
  };

  const handleSubmit = async (data: FormData) => {
    try {
      if (!profile?.id || !isTitular) {
        safeCloseDialog(onClose);
        return;
      }
      await usuarioApi.atualizarCanalAquisicao(profile.id, data.canal_aquisicao);
      toast.success("Obrigado por responder!", {
        description: "Sua resposta nos ajuda a melhorar.",
      });
      await refreshProfile();
      safeCloseDialog(onClose);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao salvar a resposta.";
      toast.error("Erro ao salvar", { description: errorMessage });
    }
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleDismiss();
    }
  };

  if (profile && !isTitular) {
    return null;
  }

  return (
    <BaseDialog open={isOpen} onOpenChange={handleOpenChange}>
      <BaseDialog.Header
        title="Como você conheceu o Van360?"
        icon={<Megaphone className="w-5 h-5" />}
        onClose={handleDismiss}
      />
      <BaseDialog.Body>
        <div className="mb-6 mt-2 text-sm text-slate-600">
          Conta pra gente rapidinho: por onde você ouviu falar ou encontrou o aplicativo pela primeira vez?
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
                      {CANAL_AQUISICAO_ORDERED_OPTIONS.map((channelKey) => (
                        <SelectItem key={channelKey} value={channelKey}>
                          {CanalAquisicaoLabels[channelKey]}
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
          label="Agora não"
          variant="outline"
          onClick={handleDismiss}
          disabled={form.formState.isSubmitting}
        />
        <BaseDialog.Action
          label="Confirmar"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={form.formState.isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
