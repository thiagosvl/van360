import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TipoPerguntaPersonalizadaEnum } from "@/constants/formularioExterno";
import { usePassageiroDadosComplementaresForm } from "@/hooks/form/usePassageiroDadosComplementaresForm";
import { safeCloseDialog } from "@/hooks";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { ClipboardList, X } from "lucide-react";

export interface PassageiroDadosComplementaresDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro | Partial<Passageiro> | null;
  onSuccess?: (updatedPassageiro?: Passageiro, hasChanges?: boolean) => void;
}

export function PassageiroDadosComplementaresDialog({
  isOpen,
  onClose,
  passageiro,
  onSuccess,
}: PassageiroDadosComplementaresDialogProps) {
  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const { form, fields, isSaving, handleSubmit } =
    usePassageiroDadosComplementaresForm({
      isOpen,
      passageiro,
      onSuccess,
      onClose: handleClose,
    });

  const watchedItens = form.watch("itens");

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="lg">
      <BaseDialog.Header
        title="Informações Complementares"
        subtitle={`Gerencie as informações complementares de ${passageiro?.nome || "aluno"}.`}
        icon={<ClipboardList className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <Banner
          variant="info"
          description="Apenas os itens preenchidos abaixo serão exibidos na carteirinha do aluno e impressos no PDF do contrato."
          className="mb-4"
        />

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((fieldItem, index) => {
              const currentItem = watchedItens?.[index];
              const isSimNao =
                fieldItem.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO;
              const boolVal = currentItem?.resposta_booleana;

              return (
                <div
                  key={fieldItem.fieldKey}
                  className="space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-[#0a0a0a] leading-snug">
                      {fieldItem.pergunta}
                    </p>
                    {isSimNao && boolVal !== null && boolVal !== undefined && (
                      <button
                        type="button"
                        onClick={() => {
                          form.setValue(`itens.${index}.resposta_booleana`, null);
                          form.setValue(`itens.${index}.resposta_texto`, "");
                        }}
                        className="text-[11px] font-medium text-[#737373] hover:text-[#0a0a0a] flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Limpar resposta"
                      >
                        <X className="w-3 h-3" />
                        Limpar
                      </button>
                    )}
                  </div>

                  {isSimNao ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            form.setValue(
                              `itens.${index}.resposta_booleana`,
                              false,
                              { shouldValidate: true }
                            );
                            form.setValue(`itens.${index}.resposta_texto`, "", {
                              shouldValidate: true,
                            });
                          }}
                          className={cn(
                            "h-10 rounded-[18px] text-xs border transition-all cursor-pointer",
                            boolVal === false
                              ? "bg-primary/10 text-primary border-primary/25 font-semibold shadow-2xs"
                              : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5] font-medium hover:bg-[#ededed] hover:text-[#0a0a0a]"
                          )}
                        >
                          Não
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            form.setValue(
                              `itens.${index}.resposta_booleana`,
                              true,
                              { shouldValidate: true }
                            );
                          }}
                          className={cn(
                            "h-10 rounded-[18px] text-xs border transition-all cursor-pointer",
                            boolVal === true
                              ? "bg-primary/10 text-primary border-primary/25 font-semibold shadow-2xs"
                              : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5] font-medium hover:bg-[#ededed] hover:text-[#0a0a0a]"
                          )}
                        >
                          Sim
                        </button>
                      </div>

                      {boolVal === true && (
                        <FormField
                          control={form.control}
                          name={`itens.${index}.resposta_texto`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormControl>
                                <Input
                                  placeholder={
                                    fieldItem.placeholder_detalhe ||
                                    "Especifique os detalhes..."
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
                      )}
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name={`itens.${index}.resposta_texto`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormControl>
                            <Input
                              placeholder={
                                fieldItem.placeholder_detalhe ||
                                "Digite a resposta (deixe em branco se não aplicável)..."
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
                  )}
                </div>
              );
            })}
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={handleClose}
          disabled={isSaving}
        />
        <BaseDialog.Action
          label="Salvar"
          onClick={handleSubmit}
          isLoading={isSaving}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
