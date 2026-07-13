import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { SignaturePad, SignaturePadRef } from "@/components/common/SignaturePad";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_CLAUSULAS_CONTRATO } from "@/constants/defaults";
import { usePreviewContrato } from "@/hooks/api/useContratos";
import { useProfile } from "@/hooks/business/useProfile";
import { cn } from "@/lib/utils";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { usuarioApi } from "@/services/api/usuario.api";
import { queryClient } from "@/services/queryClient";
import { toast } from "@/utils/notifications/toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ChevronLeft,
  DollarSign,
  FileText,
  Loader2,
  PenTool,
  Plus,
  Trash2,
  Timer,
  Scale,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ContractSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (usarContratos?: boolean) => void;
}

enum SetupStep {
  FEES = 0,
  CLAUSES = 1,
  SIGNATURE = 2,
  PREVIEW = 3,
}

export default function ContractSetupDialog({ isOpen, onClose, onSuccess }: ContractSetupDialogProps) {
  const { profile, refreshProfile } = useProfile();
  const [step, setStep] = useState<SetupStep>(SetupStep.FEES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const previewMutation = usePreviewContrato();

  const [multaAtraso, setMultaAtraso] = useState<{ valor: number; tipo: "percentual" | "fixo" }>({
    valor: 10,
    tipo: "fixo",
  });
  const [multaRescisao, setMultaRescisao] = useState<{ valor: number; tipo: "percentual" | "fixo" }>({
    valor: 15,
    tipo: "fixo",
  });
  const [clausulas, setClausulas] = useState<string[]>([]);
  const [signatureTemp, setSignatureTemp] = useState<string | null>(null);
  const sigPad = useRef<SignaturePadRef>(null);
  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const pdfUrlRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) window.URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      return;
    }
    if (isOpen && profile && !initializedRef.current) {
      setClausulas(profile.config_contrato?.clausulas ?? DEFAULT_CLAUSULAS_CONTRATO);
      const isDefault = !profile.config_contrato?.usar_contratos;
      if (profile.config_contrato?.multa_atraso) {
        setMultaAtraso(isDefault ? { ...profile.config_contrato.multa_atraso, tipo: "fixo" } : profile.config_contrato.multa_atraso);
      }
      if (profile.config_contrato?.multa_rescisao) {
        setMultaRescisao(isDefault ? { ...profile.config_contrato.multa_rescisao, tipo: "fixo" } : profile.config_contrato.multa_rescisao);
      }
      if (profile.assinatura_digital_url && !signatureTemp) setSignatureTemp(profile.assinatura_digital_url);

      setStep(SetupStep.FEES);

      initializedRef.current = true;
    }
  }, [isOpen, profile, signatureTemp]);

  const captureSignature = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      const sig = sigPad.current.toDataURL("image/png");
      setSignatureTemp(sig);
      return sig;
    }
    return signatureTemp;
  };

  const handleNext = () => {
    if (step === SetupStep.CLAUSES) {
      const cleanClausulas = clausulas.filter((c) => c.trim() !== "");
      if (cleanClausulas.length === 0) {
        toast.error("validacao.campoObrigatorio");
        return;
      }
      if (clausulas.some((c) => c.trim() === "")) {
        setShowErrors(true);
        toast.error("validacao.formularioComErros");
        return;
      }
      setShowErrors(false);
      setClausulas(cleanClausulas);
    }
    if (step === SetupStep.SIGNATURE) {
      const hasDrawing = sigPad.current && !sigPad.current.isEmpty();
      if (!hasDrawing && !profile?.assinatura_digital_url && !signatureTemp) {
        toast.error("validacao.campoObrigatorio");
        return;
      }
      captureSignature();
    }
    if (step === SetupStep.PREVIEW) {
      handleFinalSubmit();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === SetupStep.SIGNATURE) captureSignature();
    setStep((s) => (s > 0 ? s - 1 : s));
  };

  const currentStepTitle = () => {
    switch (step) {
      case SetupStep.FEES: return "Penalidades e Multas";
      case SetupStep.CLAUSES: return "Cláusulas e Termos";
      case SetupStep.SIGNATURE: return "Assinatura Digital";
      case SetupStep.PREVIEW: return "Revisão do Contrato";
      default: return "Configurar Contratos";
    }
  };

  const handleFinalSubmit = async () => {
    if (!profile?.id) return;
    setIsSubmitting(true);
    try {
      let signatureUrl = signatureTemp || profile.assinatura_digital_url;
      if (step === SetupStep.SIGNATURE || step === SetupStep.PREVIEW) {
        if (sigPad.current && !sigPad.current.isEmpty()) {
          signatureUrl = sigPad.current.toDataURL("image/png");
        }
      }
      const finalClausulas = clausulas.filter((c) => c.trim() !== "");
      await usuarioApi.atualizarUsuario(profile.id, {
        assinatura_digital_url: signatureUrl,
        config_contrato: {
          usar_contratos: true,
          multa_atraso: multaAtraso,
          multa_rescisao: multaRescisao,
          clausulas: finalClausulas,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      await refreshProfile();
      if (onSuccess) onSuccess(true);
      onClose();
      toast.success("Configurações salvas com sucesso!");
    } catch (err) {
      toast.error("erro.salvar");
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderFees = () => (
    <div className="space-y-4">
      {[
        {
          label: "Multa por Atraso",
          desc: "Aplicada sobre o valor da parcela em caso de atraso no pagamento.",
          state: multaAtraso,
          setState: setMultaAtraso,
          icon: Timer,
          iconColor: "text-[#1a3a5c]",
          simBaseLabel: "Exemplo Parcela",
          simResultLabel: "Total com Atraso",
          simBaseValue: 200,
          simValue:
            multaAtraso.tipo === "percentual"
              ? (200 * (1 + multaAtraso.valor / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : (200 + multaAtraso.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          simColor: "text-[#1a3a5c]",
        },
        {
          label: "Multa por Rescisão",
          desc: "Cobrada se o contrato for encerrado antes do prazo estipulado.",
          state: multaRescisao,
          setState: setMultaRescisao,
          icon: Scale,
          iconColor: "text-[#1a3a5c]",
          simBaseLabel: "Exemplo Contrato Anual",
          simResultLabel: "Multa Rescisória",
          simBaseValue: 2400,
          simValue:
            multaRescisao.tipo === "percentual"
              ? (2400 * (multaRescisao.valor / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : multaRescisao.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          simColor: "text-[#1a3a5c]",
        },
      ].map(({ label, desc, state, setState, icon: Icon, iconColor, simBaseLabel, simResultLabel, simBaseValue, simValue, simColor }) => (
        <div key={label} className="p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex gap-3">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <Label className="text-[#1a3a5c] font-black text-sm block">
                {label}
              </Label>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-0.5">{desc}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Forma de cobrança</Label>
              <div className="flex bg-slate-100 p-1 rounded-xl w-full border border-slate-200/20">
                <button
                  type="button"
                  onClick={() => setState({ ...state, tipo: "fixo" })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[11px] font-black transition-all",
                    state.tipo === "fixo"
                      ? "bg-white text-[#1a3a5c] shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Valor Fixo (R$)
                </button>
                <button
                  type="button"
                  onClick={() => setState({ ...state, tipo: "percentual" })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[11px] font-black transition-all",
                    state.tipo === "percentual"
                      ? "bg-white text-[#1a3a5c] shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Porcentagem (%)
                </button>
              </div>
            </div>

            <div>
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Valor da multa</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={state.tipo === "percentual" ? (state.valor === 0 ? "" : state.valor.toString()) : (state.valor === 0 ? "" : moneyMask(state.valor))}
                  onChange={(e) => {
                    if (state.tipo === "percentual") {
                      const val = e.target.value.replace(/\D/g, "");
                      const numVal = val === "" ? 0 : Number(val);
                      setState({ ...state, valor: numVal });
                    } else {
                      const val = moneyMask(e.target.value);
                      const numVal = moneyToNumber(val);
                      setState({ ...state, valor: numVal });
                    }
                  }}
                  className={cn(
                    "w-full h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/5 font-black text-base text-[#1a3a5c] pl-4",
                    state.tipo === "percentual" ? "pr-10 text-left" : "pr-4 text-left"
                  )}
                  placeholder={state.tipo === "percentual" ? "0" : "R$ 0,00"}
                />
                {state.tipo === "percentual" && (
                  <span className="absolute right-4 top-3.5 text-sm font-black text-[#1a3a5c]/40">%</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/40 space-y-2">
            <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              <span>{simBaseLabel}</span>
              <span>{simResultLabel}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-500">
                {simBaseValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <div className="text-right">
                <span className={cn("text-base font-black leading-none", simColor)}>{simValue}</span>
                <p className="text-[9px] font-bold text-slate-400 mt-1 leading-none">
                  {state.tipo === "percentual"
                    ? `+ ${state.valor}% (${(simBaseValue * (state.valor / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`
                    : `+ ${state.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderClauses = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[#1a3a5c]">
        </div>
        <div className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200/50">
          {clausulas.length} {clausulas.length === 1 ? "Cláusula" : "Cláusulas"}
        </div>
      </div>
      <div className="space-y-4">
        {clausulas.map((clausula, idx) => (
          <motion.div
            key={idx}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-[2rem] border transition-all overflow-hidden shadow-sm",
              showErrors && clausula.trim() === "" ? "border-red-200 bg-red-50/30" : "border-slate-100 bg-white"
            )}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-1">
              <span className="text-[9px] font-black text-[#1a3a5c]/60 bg-slate-50 px-2 py-0.5 rounded-lg uppercase tracking-wider border border-slate-100/50">
                CLÁUSULA {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => setClausulas(clausulas.filter((_, i) => i !== idx))}
                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              className={cn(
                "w-full px-6 pb-6 pt-2 text-[13px] bg-transparent border-0 focus:outline-none focus:ring-0 resize-none leading-relaxed placeholder:text-slate-300 italic font-medium",
                showErrors && clausula.trim() === "" ? "text-red-900 placeholder:text-red-300" : "text-slate-600 placeholder:text-slate-200"
              )}
              value={clausula}
              rows={3}
              onChange={(e) => {
                const newClausulas = [...clausulas];
                newClausulas[idx] = e.target.value;
                setClausulas(newClausulas);
              }}
              placeholder="Ex: O transporte será realizado exclusivamente em dias úteis..."
            />
            {showErrors && clausula.trim() === "" && (
              <div className="px-6 pb-4">
                <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider italic">Campo obrigatório</p>
              </div>
            )}
          </motion.div>
        ))}
        <Button
          variant="outline"
          className="w-full h-14 border-dashed border-2 border-slate-200 text-[#1a3a5c] bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 rounded-[2rem] group transition-all active:scale-[0.98] font-black uppercase text-[10px] tracking-wider"
          onClick={() => setClausulas([...clausulas, ""])}
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform text-[#1a3a5c]/60" />
          Adicionar Cláusula
        </Button>
      </div>
    </div>
  );

  const renderSignature = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-2">
        <p className="text-[11px] text-slate-500 italic px-6 font-medium leading-relaxed">
          Sua assinatura aparecerá no final de todos os contratos em PDF de forma automatizada.
        </p>
      </div>
      <SignaturePad ref={sigPad} initialValue={signatureTemp} onChange={setSignatureTemp} />
      <div className="bg-amber-50 rounded-3xl p-4 border border-amber-100 flex gap-3 mx-2">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
          <strong>Atenção:</strong> Esta assinatura tem validade jurídica. Certifique-se de que ela esteja legível e represente sua assinatura oficial.
        </p>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-3">
      <div className="text-center space-y-0.5">
        <p className="text-[10px] text-slate-500 italic font-medium px-4 leading-relaxed">Só confirme após revisar as configurações.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-slate-50 rounded-3xl border border-slate-100/60 flex flex-col items-center text-center">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Multa Atraso</p>
          <p className="text-xs font-semibold text-[#1a3a5c] tracking-tight">
            {multaAtraso.tipo === "percentual" ? `${multaAtraso.valor}%` : moneyMask(multaAtraso.valor)}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-3xl border border-slate-100/60 flex flex-col items-center text-center">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Multa Rescisão</p>
          <p className="text-xs font-semibold text-[#1a3a5c] tracking-tight">
            {multaRescisao.tipo === "percentual" ? `${multaRescisao.valor}%` : moneyMask(multaRescisao.valor)}
          </p>
        </div>
        <div className="col-span-2 p-3 bg-slate-50 rounded-3xl border border-slate-100/60 flex flex-col items-center text-center">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cláusulas</p>
          <p className="text-[10px] font-semibold text-[#1a3a5c] uppercase">{clausulas.filter((c) => c.trim()).length}</p>
        </div>
      </div>
      <div className="space-y-3 px-2">
        <Button
          variant="outline"
          className="w-full h-12 border border-slate-200 text-[#1a3a5c] hover:bg-slate-50 rounded-2xl font-black uppercase text-[10px] tracking-widest group transition-all active:scale-[0.98]"
          disabled={previewMutation.isPending}
          onClick={async () => {
            try {
              const result = await previewMutation.mutateAsync({
                clausulas,
                multaAtraso,
                multaRescisao,
                assinaturaCondutorUrl: signatureTemp || profile?.assinatura_digital_url,
              });
              if (pdfUrlRef.current) window.URL.revokeObjectURL(pdfUrlRef.current);
              pdfUrlRef.current = result.url;
              setPdfUrl(result.url);
              setIsPreviewPdfOpen(true);
            } catch (err) { }
          }}
        >
          {previewMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <FileText className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform opacity-70" />
          )}
          Visualizar Modelo
        </Button>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-800 leading-relaxed italic">
            Ao confirmar, os contratos passarão a ser gerados seguindo as configurações definidas acima.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <BaseDialog
        open={isOpen}
        onOpenChange={(open) => { if (!open) onClose(); }}
        maxWidth="lg"
      >
        <BaseDialog.Header
          title={currentStepTitle()}
          icon={<FileText className="w-5 h-5 opacity-80" />}
          showSteps
          currentStep={step + 1}
          totalSteps={4}
          hideCloseButton={false}
          onClose={onClose}
        />
        <BaseDialog.Body animate animationKey={step} className="min-h-[300px]">
          {step === SetupStep.FEES && renderFees()}
          {step === SetupStep.CLAUSES && renderClauses()}
          {step === SetupStep.SIGNATURE && renderSignature()}
          {step === SetupStep.PREVIEW && renderPreview()}
        </BaseDialog.Body>
        <BaseDialog.Footer>
          {step > 0 && (
            <BaseDialog.Action
              label="Voltar"
              variant="secondary"
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={handleBack}
              disabled={isSubmitting}
            />
          )}
          <BaseDialog.Action
            label={
              step === SetupStep.PREVIEW
                ? "Confirmar"
                : "Continuar"
            }
            onClick={handleNext}
            isLoading={isSubmitting}
          />
        </BaseDialog.Footer>
      </BaseDialog>
      <PdfPreviewDialog
        isOpen={isPreviewPdfOpen}
        onClose={() => setIsPreviewPdfOpen(false)}
        pdfUrl={pdfUrl}
        title="Modelo do Contrato"
      />
    </>
  );
}
