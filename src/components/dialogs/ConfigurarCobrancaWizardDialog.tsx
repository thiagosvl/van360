import BaseDialog from "@/components/ui/BaseDialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { safeCloseDialog } from "@/hooks";
import { TipoChavePix } from "@/types/pix";
import {
  useConfigurarCobrancaWizardViewModel,
  WizardModalidade,
  WIZARD_STEP,
  WIZARD_MODALIDADE,
} from "@/hooks/ui/useConfigurarCobrancaWizardViewModel";
import { PREVIEW_COBRANCA_MODALIDADE } from "@/components/dialogs/WhatsAppCobrancaPreviewDialog";
import { useLayout } from "@/contexts/LayoutContext";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import {
  Key,
  CircleDollarSign,
  ReceiptText,
  Minus,
  Plus,
  Receipt,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

export interface ConfigurarCobrancaWizardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  modalidade: WizardModalidade;
  aplicar_a_todos?: boolean;
  onSuccess?: () => void;
}

export default function ConfigurarCobrancaWizardDialog({
  isOpen,
  onClose,
  modalidade,
  aplicar_a_todos,
  onSuccess,
}: ConfigurarCobrancaWizardDialogProps) {
  const { openWhatsAppCobrancaPreviewDialog } = useLayout();

  const {
    step,
    totalSteps,
    currentStepNumber,
    isSubmitting,
    tipoChave,
    chavePix,
    enviarRecibo,
    avisoPrevioAtivo,
    diasAvisoPrevio,
    vencimentoHojeAtivo,
    atraso3DiasAtivo,
    taxaFormatada,
    taxaEfetiva,
    isPixValido,
    pixErrorMessage,
    setChavePixTouched,
    handleTipoChaveChange,
    handleChavePixChange,
    setEnviarRecibo,
    setAvisoPrevioAtivo,
    setVencimentoHojeAtivo,
    setAtraso3DiasAtivo,
    handleDiasStep,
    handleBack,
    handleSkipPix,
    handleNext,
  } = useConfigurarCobrancaWizardViewModel({
    modalidade,
    aplicar_a_todos,
    onClose,
    onSuccess,
  });

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const getStepTitle = () => {
    if (step === WIZARD_STEP.PIX) {
      return modalidade === WIZARD_MODALIDADE.AUTOMATICA
        ? "Chave Pix para Repasse"
        : "Chave Pix no WhatsApp";
    }
    if (step === WIZARD_STEP.TAXAS) {
      return "Taxa do Pix e Repasse";
    }
    return "Avisos no WhatsApp";
  };

  const getStepIcon = () => {
    if (step === WIZARD_STEP.PIX) {
      return (
        <Key
          className={cn(
            "w-5 h-5",
            modalidade === WIZARD_MODALIDADE.AUTOMATICA ? "text-emerald-600" : "text-primary"
          )}
        />
      );
    }
    if (step === WIZARD_STEP.TAXAS) {
      return <CircleDollarSign className="w-5 h-5 text-emerald-600" />;
    }
    return <ReceiptText className="w-5 h-5 text-primary" />;
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title={getStepTitle()}
        icon={getStepIcon()}
        showSteps={true}
        currentStep={currentStepNumber}
        totalSteps={totalSteps}
        onClose={handleClose}
      />

      <BaseDialog.Body className="space-y-4">
        {step === WIZARD_STEP.PIX && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                {modalidade === WIZARD_MODALIDADE.AUTOMATICA
                  ? "Onde você deseja receber os repasses?"
                  : "Deseja enviar sua chave Pix nos lembretes?"}
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                {modalidade === WIZARD_MODALIDADE.AUTOMATICA
                  ? "Cadastre sua chave Pix. O valor das parcelas pagas pelos pais será transferido automaticamente para a conta dela."
                  : "Informe sua chave abaixo para que a gente possa envia-la nos lembretes. Caso não utilize Pix, clique em 'Não usar Pix'."}
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-[18px] bg-white border border-[#e5e5e5]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-[14px] bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0 border border-[#25D366]/20">
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[#0a0a0a]">
                    Exemplo no WhatsApp
                  </p>
                  <p className="text-[11px] text-[#737373] truncate mt-0.5">
                    {modalidade === WIZARD_MODALIDADE.AUTOMATICA
                      ? "Veja a mensagem com QR Code Pix dinâmico"
                      : chavePix
                        ? "Veja a mensagem com sua chave Pix"
                        : "Veja como os responsáveis recebem o aviso"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  openWhatsAppCobrancaPreviewDialog({
                    modalidade:
                      modalidade === WIZARD_MODALIDADE.AUTOMATICA
                        ? PREVIEW_COBRANCA_MODALIDADE.AUTOMATICA
                        : PREVIEW_COBRANCA_MODALIDADE.LEMBRETE,
                    userChavePix: chavePix || null,
                  })
                }
                className="shrink-0 h-9 px-4 rounded-[18px] bg-white border border-[#e5e5e5] hover:bg-[#f5f5f5] text-[#0a0a0a] text-xs sm:text-sm font-medium transition-colors cursor-pointer ml-2 inline-flex items-center justify-center"
              >
                Visualizar
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#0a0a0a]">Tipo de Chave</label>
                <NativeSelect
                  value={tipoChave || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleTipoChaveChange(val ? (val as TipoChavePix) : undefined);
                  }}
                >
                  <option value="" disabled>
                    Selecionar tipo...
                  </option>
                  <option value={TipoChavePix.CPF}>CPF</option>
                  <option value={TipoChavePix.CNPJ}>CNPJ</option>
                  <option value={TipoChavePix.EMAIL}>E-mail</option>
                  <option value={TipoChavePix.TELEFONE}>Telefone Celular</option>
                  <option value={TipoChavePix.ALEATORIA}>Chave Aleatória</option>
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#0a0a0a]">Chave Pix</label>
                <Input
                  placeholder={
                    tipoChave ? "Digite sua chave Pix" : "Selecione o tipo de chave primeiro"
                  }
                  value={chavePix}
                  disabled={!tipoChave}
                  type={tipoChave === TipoChavePix.TELEFONE ? "tel" : "text"}
                  aria-invalid={Boolean(pixErrorMessage)}
                  onChange={(e) => handleChavePixChange(e.target.value)}
                  onBlur={() => setChavePixTouched(true)}
                />
                {pixErrorMessage && (
                  <p className="text-xs font-normal text-[#e7000b] ml-1">
                    {pixErrorMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === WIZARD_STEP.TAXAS && (
          <div className="space-y-4">
            <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                  Taxa por cobrança recebida
                </h4>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Cobrada exclusivamente quando o pai paga via Pix. Sem mensalidade ou taxas fixas.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold text-sm">
                <span>{taxaFormatada}</span>
                <span className="text-[10px] font-normal text-emerald-600">/ por parcela paga</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <label
                    htmlFor="wizard-switch-enviar-recibo"
                    className="text-xs sm:text-sm font-medium text-[#0a0a0a] flex items-center gap-2 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-[#737373]" />
                    Enviar recibo automático no WhatsApp?
                  </label>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Envia o comprovante oficial no WhatsApp do responsável assim que o Pix for confirmado.
                  </p>
                </div>
                <Switch
                  id="wizard-switch-enviar-recibo"
                  checked={enviarRecibo}
                  onCheckedChange={setEnviarRecibo}
                />
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e5e5e5] p-3.5 bg-[#fafafa] space-y-2.5">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                Simulação (Exemplo: Parcela de R$ 300,00)
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[12px] bg-white border border-[#e5e5e5]">
                  <span className="text-[#737373] text-[10px]">Cobrado dos Pais</span>
                  <p className="font-semibold text-sm text-[#0a0a0a]">
                    R$ 300,00
                  </p>
                </div>
                <div className="p-2.5 rounded-[12px] bg-emerald-50/60 border border-emerald-200/60">
                  <span className="text-emerald-700 text-[10px] font-medium">Você Recebe Líquido</span>
                  <p className="font-bold text-sm text-emerald-800">
                    {formatCurrency(Math.max(0, 300 - taxaEfetiva))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === WIZARD_STEP.AVISOS && (
          <div className="space-y-4">
            <div className="divide-y divide-[#e5e5e5] space-y-3.5">
              <div className="space-y-2 pt-1 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0 pr-1">
                    <h3 className="text-xs sm:text-sm font-medium text-[#0a0a0a] leading-tight">
                      Lembrete antes do vencimento
                    </h3>
                    <p className="text-xs text-[#737373]">
                      Avisa os pais com antecedência para lembrarem da parcela.
                    </p>
                  </div>
                  <Switch
                    checked={avisoPrevioAtivo}
                    onCheckedChange={setAvisoPrevioAtivo}
                  />
                </div>

                {avisoPrevioAtivo && (
                  <div className="pt-1 w-full">
                    <div className="w-full flex items-center justify-between bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-1 shadow-none">
                      <button
                        type="button"
                        disabled={diasAvisoPrevio <= 1}
                        onClick={() => handleDiasStep(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-[14px] bg-white text-[#0a0a0a] hover:bg-[#f5f5f5] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all border border-[#e5e5e5] cursor-pointer"
                        title="Diminuir antecedência"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-medium text-[#0a0a0a] px-3 text-center select-none">
                        {diasAvisoPrevio} {diasAvisoPrevio === 1 ? "dia antes" : "dias antes"}
                      </span>
                      <button
                        type="button"
                        disabled={diasAvisoPrevio >= 5}
                        onClick={() => handleDiasStep(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-[14px] bg-white text-[#0a0a0a] hover:bg-[#f5f5f5] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all border border-[#e5e5e5] cursor-pointer"
                        title="Aumentar antecedência"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-3">
                <div className="space-y-0.5 min-w-0 pr-1">
                  <h3 className="text-xs sm:text-sm font-medium text-[#0a0a0a] leading-tight">
                    Lembrete no dia do vencimento
                  </h3>
                  <p className="text-xs text-[#737373]">
                    Envia mensagem na data exata em que a parcela vence.
                  </p>
                </div>
                <Switch
                  checked={vencimentoHojeAtivo}
                  onCheckedChange={setVencimentoHojeAtivo}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3">
                <div className="space-y-0.5 min-w-0 pr-1">
                  <h3 className="text-xs sm:text-sm font-medium text-[#0a0a0a] leading-tight">
                    Lembrete de atraso (3 dias após)
                  </h3>
                  <p className="text-xs text-[#737373]">
                    Avisa o responsável caso a parcela continue pendente após 3 dias.
                  </p>
                </div>
                <Switch
                  checked={atraso3DiasAtivo}
                  onCheckedChange={setAtraso3DiasAtivo}
                />
              </div>
            </div>
          </div>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        {step !== WIZARD_STEP.PIX ? (
          <BaseDialog.Action
            label="Voltar"
            variant="outline"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleBack}
            disabled={isSubmitting}
          />
        ) : modalidade === WIZARD_MODALIDADE.LEMBRETES ? (
          <BaseDialog.Action
            label="Não usar Pix"
            variant="outline"
            onClick={handleSkipPix}
            disabled={isSubmitting}
          />
        ) : (
          <BaseDialog.Action
            label="Cancelar"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          />
        )}

        <BaseDialog.Action
          label={step === WIZARD_STEP.AVISOS ? "Concluir Ativação" : "Avançar"}
          variant="primary"
          icon={step === WIZARD_STEP.AVISOS ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          onClick={handleNext}
          isLoading={isSubmitting}
          disabled={step === WIZARD_STEP.PIX && !isPixValido}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
