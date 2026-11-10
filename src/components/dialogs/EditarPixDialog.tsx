import BaseDialog from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ModoCobrancaEnum } from "@/types/enums";
import { useEditarPixForm } from "@/hooks/form/useEditarPixForm";
import { PixKeyFields } from "@/components/features/pix/PixKeyFields";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import { Key, Sparkles, Trash2 } from "lucide-react";

interface EditarPixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  isActivatingAutomatica?: boolean;
  aplicarATodos?: boolean;
}

export default function EditarPixDialog({
  isOpen,
  onClose,
  onSuccess,
  isActivatingAutomatica = false,
  aplicarATodos,
}: EditarPixDialogProps) {
  const {
    form,
    temChave,
    modoAtual,
    deveExibirCamposPix,
    podeRemoverChave,
    taxaEfetiva,
    taxaFormatada,
    isSaving,
    originalTipoRef,
    originalChaveRef,
    cienteTaxaRef,
    handleClose,
    handleSubmit,
    onFormError,
    handleRemoverPix,
  } = useEditarPixForm({
    isOpen,
    onClose,
    onSuccess,
    isActivatingAutomatica,
    aplicarATodos,
  });

  const valorExemplo = 300;
  const valorLiquidoExemplo = formatCurrency(Math.max(0, valorExemplo - taxaEfetiva));

  const dialogTitle = isActivatingAutomatica
    ? "Ativar Cobrança Automática"
    : temChave
      ? "Chave Pix Geral"
      : "Cadastrar Chave Pix Geral";

  const dialogSubtitle = isActivatingAutomatica
    ? deveExibirCamposPix
      ? "Informe sua chave Pix e confirme a taxa do serviço"
      : "Confirme as condições para ativar na sua conta"
    : "Vale para todas as vans e alunos sem chave própria";

  const bannerDescription = isActivatingAutomatica
    ? "Informe a chave Pix onde você receberá o valor das parcelas pagas."
    : modoAtual === ModoCobrancaEnum.AUTOMATICA
      ? "Chave padrão para repasse das vans e alunos sem chave própria."
      : "Chave enviada nos lembretes do WhatsApp para vans e alunos sem chave própria.";

  const submitLabel = isActivatingAutomatica
    ? deveExibirCamposPix
      ? "Salvar e Ativar"
      : "Confirmar e Ativar"
    : "Salvar";

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title={dialogTitle}
        subtitle={dialogSubtitle}
        icon={
          isActivatingAutomatica ? (
            <Sparkles className="w-5 h-5 text-[#0a0a0a]" />
          ) : (
            <Key className="w-5 h-5 text-[#0a0a0a]" />
          )
        }
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <Form {...form}>
          <form
            id="editar-pix-form"
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-4"
          >
            {deveExibirCamposPix && (
              <>
                <Banner variant="info" description={bannerDescription} />

                <PixKeyFields
                  form={form}
                  isBusy={isSaving}
                  originalTipoRef={originalTipoRef}
                  originalChaveRef={originalChaveRef}
                />
              </>
            )}

            {isActivatingAutomatica && (
              <div className="space-y-3">
                <div className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                        Taxa por parcela liquidada
                      </span>
                      <span className="text-xs text-[#737373] block leading-relaxed">
                        Descontada apenas quando o pai paga via Pix. Sem mensalidade ou custo de emissão.
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-[18px] bg-[#171717] text-[#fafafa] font-medium text-xs shrink-0">
                      {taxaFormatada}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#e5e5e5] space-y-2">
                    <span className="text-xs font-medium text-[#737373] block">
                      Exemplo prático (parcela de R$ 300,00):
                    </span>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-[10px] bg-white border border-[#e5e5e5]">
                        <span className="text-[#737373] text-[11px] block">Cobrado dos pais</span>
                        <p className="font-semibold text-xs sm:text-sm text-[#0a0a0a] mt-0.5">
                          R$ 300,00
                        </p>
                      </div>
                      <div className="p-2.5 rounded-[10px] bg-white border border-[#e5e5e5]">
                        <span className="text-[#737373] text-[11px] block">Taxa descontada</span>
                        <p className="font-semibold text-xs sm:text-sm text-[#0a0a0a] mt-0.5">
                          - {taxaFormatada}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-[10px] bg-white border border-[#e5e5e5]">
                        <span className="text-[#737373] text-[11px] block">Cai na sua conta</span>
                        <p className="font-semibold text-xs sm:text-sm text-[#0a0a0a] mt-0.5">
                          {valorLiquidoExemplo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="ciente_taxa"
                  render={({ field, fieldState }) => (
                    <FormItem ref={cienteTaxaRef} className="space-y-1.5">
                      <div
                        className={cn(
                          "flex items-start gap-3 p-3.5 rounded-[18px] border transition-colors",
                          fieldState.error
                            ? "border-[#e7000b] bg-[#e7000b]/[0.06]"
                            : field.value
                              ? "border-primary/40 bg-primary/[0.03]"
                              : "border-[#e5e5e5] bg-white hover:bg-[#fafafa]"
                        )}
                      >
                        <FormControl>
                          <Checkbox
                            checked={Boolean(field.value)}
                            disabled={isSaving}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            className="mt-0.5 cursor-pointer"
                          />
                        </FormControl>
                        <FormLabel className="flex-1 text-xs sm:text-sm font-medium text-[#0a0a0a] leading-relaxed cursor-pointer select-none m-0">
                          Estou ciente de que será descontada uma taxa de{" "}
                          <span className="font-semibold">{taxaFormatada}</span> de cada parcela paga
                          automaticamente via Pix.
                        </FormLabel>
                      </div>
                      <FormMessage className="ml-1" />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </form>
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        {podeRemoverChave ? (
          <BaseDialog.Action
            label="Remover"
            variant="outline"
            icon={<Trash2 className="w-4 h-4 text-[#e7000b]" />}
            onClick={handleRemoverPix}
            disabled={isSaving}
            className="text-[#e7000b] hover:text-[#e7000b] hover:bg-[#e7000b]/[0.08] border-[#e7000b]/20"
          />
        ) : (
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          />
        )}
        <BaseDialog.Action
          label={submitLabel}
          type="submit"
          form="editar-pix-form"
          isLoading={isSaving}
          variant="primary"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
