import { useRef } from "react";
import BaseDialog from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
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
  Receipt,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  TrendingUp,
  BellOff,
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
  const bodyRef = useRef<HTMLDivElement>(null);
  const pixFormRef = useRef<HTMLDivElement>(null);

  const {
    step,
    totalSteps,
    currentStepNumber,
    isSubmitting,
    tipoChave,
    chavePix,
    enviarRecibo,
    vencimentoHojeAtivo,
    atraso3DiasAtivo,
    taxaFormatada,
    taxaEfetiva,
    isPixValido,
    pixErrorMessage,
    incluirPix,
    handleIncluirPixChange,
    isAvancarDisabled,
    setChavePixTouched,
    handleTipoChaveChange,
    handleChavePixChange,
    setEnviarRecibo,
    setVencimentoHojeAtivo,
    setAtraso3DiasAtivo,
    handleBack,
    handleNext,
  } = useConfigurarCobrancaWizardViewModel({
    modalidade,
    aplicar_a_todos,
    onClose,
    onSuccess,
  });

  const handleSelectPix = (valor: boolean) => {
    handleIncluirPixChange(valor);
    if (valor) {
      setTimeout(() => {
        if (bodyRef.current) {
          bodyRef.current.scrollTo({
            top: bodyRef.current.scrollHeight,
            behavior: "smooth",
          });
        } else {
          pixFormRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 120);
    }
  };

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const getStepTitle = () => {
    if (step === WIZARD_STEP.BENEFICIOS) {
      return "Como Funciona a Cobrança Automática";
    }
    if (step === WIZARD_STEP.PIX) {
      return modalidade === WIZARD_MODALIDADE.AUTOMATICA
        ? "Chave Pix para Repasse"
        : "Chave Pix no WhatsApp";
    }
    if (step === WIZARD_STEP.TAXAS) {
      return "Taxa do Pix e Repasse";
    }
    return "Lembretes no WhatsApp";
  };

  const getStepIcon = () => {
    if (step === WIZARD_STEP.BENEFICIOS) {
      return <Sparkles className="w-5 h-5 text-[#0a0a0a]" />;
    }
    if (step === WIZARD_STEP.PIX) {
      return <Key className="w-5 h-5 text-[#0a0a0a]" />;
    }
    if (step === WIZARD_STEP.TAXAS) {
      return <CircleDollarSign className="w-5 h-5 text-[#0a0a0a]" />;
    }
    return <ReceiptText className="w-5 h-5 text-[#0a0a0a]" />;
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

      <BaseDialog.Body containerRef={bodyRef} className="space-y-4">
        {step === WIZARD_STEP.BENEFICIOS && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                Menos cobrança manual, mais tempo para você
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Com a cobrança automática, você não precisa conferir comprovantes bancários nem lembrar os responsáveis um a um no WhatsApp.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-emerald-50/60 border border-emerald-200/60">
                <div className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                    Baixa automática sem conferir comprovante
                  </h4>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    O responsável paga o Pix gerado e o sistema quita a parcela imediatamente, sem você precisar abrir app do banco ou pedir print.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-emerald-50/60 border border-emerald-200/60">
                <div className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                    Cálculo automático de juros e multa em atrasos
                  </h4>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    Se a parcela vencer, o código Pix já atualiza com os encargos definidos por você, sem desgaste de cobrar acréscimos na conversa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-emerald-50/60 border border-emerald-200/60">
                <div className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                    Recibo profissional enviado aos pais
                  </h4>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    Assim que o Pix for confirmado, o comprovante oficial é enviado diretamente no WhatsApp do responsável.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-emerald-50/60 border border-emerald-200/60">
                <div className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CircleDollarSign className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                    Repasse direto na sua conta Pix
                  </h4>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    O valor líquido das parcelas pagas é transferido automaticamente para a sua chave Pix no mesmo dia.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-medium text-[#0a0a0a]">
                  Taxa do serviço por parcela recebida
                </p>
                <p className="text-[11px] text-[#737373]">
                  Descontada exclusivamente quando o responsável efetuar o pagamento via Pix.
                </p>
              </div>
              <div className="shrink-0 px-2.5 py-1 rounded-[12px] bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] font-semibold text-xs">
                {taxaFormatada} / parcela
              </div>
            </div>
          </div>
        )}
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
                  ? "Cadastre sua chave Pix. O valor das parcelas pagas pelos pais será transferido automaticamente para ela."
                  : "Escolha se deseja enviar sua chave Pix nos lembretes com botão de copiar ou apenas notificar com os dados da parcela."}
              </p>
            </div>

            {modalidade === WIZARD_MODALIDADE.AUTOMATICA && (
              <Banner
                variant="info"
                description="Os pais pagarão por um QR Code Pix gerado para cada parcela. O dinheiro cai nesta sua chave Pix cadastrada."
              />
            )}

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
                      : incluirPix === true && chavePix
                        ? "Veja a mensagem com sua chave Pix"
                        : "Veja como os responsáveis recebem o lembrete"}
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
                    userChavePix:
                      modalidade === WIZARD_MODALIDADE.AUTOMATICA
                        ? chavePix || null
                        : incluirPix === true
                          ? chavePix || null
                          : null,
                  })
                }
                className="shrink-0 h-9 px-4 rounded-[18px] bg-white border border-[#e5e5e5] hover:bg-[#f5f5f5] text-[#0a0a0a] text-xs sm:text-sm font-medium transition-colors cursor-pointer ml-2 inline-flex items-center justify-center"
              >
                Visualizar
              </button>
            </div>

            {modalidade === WIZARD_MODALIDADE.LEMBRETES && (
              <div className="space-y-2.5">
                {[
                  {
                    value: true,
                    label: "Utilizar chave Pix",
                    sublabel: "Envia sua chave nos lembretes com botão de copiar para facilitar o pagamento pelos pais.",
                    icon: <Key className="w-5 h-5" />,
                  },
                  {
                    value: false,
                    label: "Não utilizar chave Pix",
                    sublabel: "Envia apenas o valor e vencimento nos lembretes, sem chave Pix.",
                    icon: <BellOff className="w-5 h-5" />,
                  },
                ].map(({ value, label, sublabel, icon }) => {
                  const isActive = incluirPix === value;
                  return (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => handleSelectPix(value)}
                      className={cn(
                        "w-full p-3.5 sm:p-4 rounded-[18px] border transition-all flex items-center gap-3.5 sm:gap-4 active:scale-[0.99] cursor-pointer group text-left",
                        isActive
                          ? "border-primary bg-white shadow-xs ring-1 ring-primary/20"
                          : "border-[#e5e5e5] bg-[#fafafa] hover:bg-white hover:border-[#737373]/40"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-colors",
                          isActive
                            ? "bg-primary text-white shadow-xs"
                            : "bg-white text-[#737373] border border-[#e5e5e5]"
                        )}
                      >
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#0a0a0a]">{label}</p>
                        <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">{sublabel}</p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                          isActive ? "border-primary bg-primary" : "border-[#e5e5e5] bg-white"
                        )}
                      >
                        {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {(modalidade === WIZARD_MODALIDADE.AUTOMATICA || incluirPix === true) && (
              <div ref={pixFormRef} className="space-y-3 pt-2">
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
            )}
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
                  Cobrada exclusivamente quando o responsável efetuar o pagamento da parcela via Pix.
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
              <div className="flex items-center justify-between gap-3 pt-1 first:pt-0">
                <div className="space-y-0.5 min-w-0 pr-1">
                  <h3 className="text-xs sm:text-sm font-medium text-[#0a0a0a] leading-tight">
                    Lembrete no dia do vencimento
                  </h3>
                  <p className="text-xs text-[#737373]">
                    Envia mensagem no WhatsApp na data exata em que a parcela vence.
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
                    Avisa o responsável no WhatsApp caso a parcela continue pendente após 3 dias.
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
        {step !== (modalidade === WIZARD_MODALIDADE.AUTOMATICA ? WIZARD_STEP.BENEFICIOS : WIZARD_STEP.PIX) ? (
          <BaseDialog.Action
            label="Voltar"
            variant="outline"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleBack}
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
          label={
            step === WIZARD_STEP.BENEFICIOS
              ? "Quero configurar"
              : step === WIZARD_STEP.AVISOS
                ? "Concluir Ativação"
                : "Avançar"
          }
          variant="primary"
          icon={step === WIZARD_STEP.AVISOS ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          onClick={handleNext}
          isLoading={isSubmitting}
          disabled={isAvancarDisabled}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
