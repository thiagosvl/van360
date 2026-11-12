import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  PerguntaPersonalizadaConfig,
  TipoPerguntaPersonalizadaEnum,
} from "@/constants/formularioExterno";
import { usePerguntaPersonalizadaForm } from "@/hooks/form/usePerguntaPersonalizadaForm";
import { safeCloseDialog } from "@/hooks";
import { cn } from "@/lib/utils";
import { CheckCircle2, FileText, HelpCircle, MessageSquarePlus } from "lucide-react";

export interface PerguntaPersonalizadaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingPergunta?: PerguntaPersonalizadaConfig | null;
  onSave: (pergunta: PerguntaPersonalizadaConfig) => Promise<void> | void;
}

export function PerguntaPersonalizadaFormDialog({
  isOpen,
  onClose,
  editingPergunta,
  onSave,
}: PerguntaPersonalizadaFormDialogProps) {
  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const { form, selectedTipo, isEditing, isSubmitting, handleSubmit } =
    usePerguntaPersonalizadaForm({
      isOpen,
      editingPergunta,
      onSave,
      onClose: handleClose,
    });

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title={isEditing ? "Editar Pergunta" : "Nova Pergunta Complementar"}
        subtitle="Configure como a pergunta será exibida para o responsável no link de cadastro."
        icon={<MessageSquarePlus className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <Banner
          variant="info"
          description="As respostas preenchidas ficam disponíveis na carteirinha do aluno e saem impressas automaticamente no PDF do contrato."
          className="mb-4"
        />

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="pergunta"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Pergunta para o Responsável <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <HelpCircle className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        placeholder="Ex: Toma algum medicamento controlado?"
                        {...field}
                        className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Formato da Resposta <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => field.onChange(TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO)}
                        className={cn(
                          "flex flex-col items-start text-left p-3.5 rounded-[18px] border transition-all cursor-pointer",
                          field.value === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO
                            ? "bg-white border-[#0a0a0a] ring-1 ring-[#0a0a0a]"
                            : "bg-[#fafafa] border-[#e5e5e5] hover:bg-[#f5f5f5]"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-[#0a0a0a]" />
                          <span className="text-xs font-semibold text-[#0a0a0a]">
                            Sim / Não + Detalhe
                          </span>
                        </div>
                        <span className="text-[11px] text-[#737373] leading-relaxed">
                          O pai marca &quot;Não&quot; ou &quot;Sim&quot;. Se marcar &quot;Sim&quot;, abre um campo para explicar qual.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => field.onChange(TipoPerguntaPersonalizadaEnum.TEXTO_LIVRE)}
                        className={cn(
                          "flex flex-col items-start text-left p-3.5 rounded-[18px] border transition-all cursor-pointer",
                          field.value === TipoPerguntaPersonalizadaEnum.TEXTO_LIVRE
                            ? "bg-white border-[#0a0a0a] ring-1 ring-[#0a0a0a]"
                            : "bg-[#fafafa] border-[#e5e5e5] hover:bg-[#f5f5f5]"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-[#0a0a0a]" />
                          <span className="text-xs font-semibold text-[#0a0a0a]">
                            Texto Aberto
                          </span>
                        </div>
                        <span className="text-[11px] text-[#737373] leading-relaxed">
                          Exibe um campo de texto livre para o responsável digitar a resposta diretamente.
                        </span>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="placeholder_detalhe"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    {selectedTipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO
                      ? "Texto de ajuda quando marcar 'Sim' (Opcional)"
                      : "Texto de ajuda dentro do campo (Opcional)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        selectedTipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO
                          ? "Ex: Informe qual medicamento e o horário"
                          : "Ex: Informe nome completo, parentesco e telefone"
                      }
                      {...field}
                      value={field.value || ""}
                      className="h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTipo === TipoPerguntaPersonalizadaEnum.TEXTO_LIVRE && (
              <FormField
                control={form.control}
                name="obrigatorio"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3.5">
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs font-semibold text-[#0a0a0a] cursor-pointer">
                        Preenchimento Obrigatório
                      </FormLabel>
                      <p className="text-[11px] text-[#737373] leading-relaxed">
                        Exige que o responsável preencha esta resposta para enviar o cadastro.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={handleClose}
          disabled={isSubmitting}
        />
        <BaseDialog.Action
          label={isEditing ? "Salvar Alterações" : "Adicionar Pergunta"}
          onClick={handleSubmit}
          isLoading={isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
