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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ContractSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (usarContratos?: boolean) => void;
  skipWelcome?: boolean;
}

enum SetupStep {
  WELCOME = 0,
  FEES = 1,
  CLAUSES = 2,
  SIGNATURE = 3,
  PREVIEW = 4,
}

export default function ContractSetupDialog({ isOpen, onClose, onSuccess, skipWelcome }: ContractSetupDialogProps) {
  const { profile, refreshProfile } = useProfile();
  const [step, setStep] = useState<SetupStep>(SetupStep.WELCOME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const previewMutation = usePreviewContrato();

  const [usarContratos, setUsarContratos] = useState(true);
  const [multaAtraso, setMultaAtraso] = useState<{ valor: number; tipo: "percentual" | "fixo" }>({
    valor: 10,
    tipo: "percentual",
  });
  const [multaRescisao, setMultaRescisao] = useState<{ valor: number; tipo: "percentual" | "fixo" }>({
    valor: 15,
    tipo: "percentual",
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
      if (profile.config_contrato?.multa_atraso) setMultaAtraso(profile.config_contrato.multa_atraso);
      if (profile.config_contrato?.multa_rescisao) setMultaRescisao(profile.config_contrato.multa_rescisao);
      if (profile.assinatura_digital_url && !signatureTemp) setSignatureTemp(profile.assinatura_digital_url);
      
      const isContratoConfigurado = !!profile.config_contrato?.configurado;
      const isContratoAtivo = profile.config_contrato?.usar_contratos ?? true;
      
      setUsarContratos(skipWelcome ? true : isContratoAtivo);

      if (skipWelcome) {
        setStep(SetupStep.FEES); // Pula para a segunda etapa
      } else {
        setStep(SetupStep.WELCOME);
      }
      
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
    if (step === SetupStep.WELCOME && !usarContratos) {
      handleFinalSubmit(false);
      return;
    }
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
      handleFinalSubmit(true);
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
      case SetupStep.WELCOME: return "Boas-Vindas";
      case SetupStep.FEES: return "Penalidades e Multas";
      case SetupStep.CLAUSES: return "Cláusulas e Termos";
      case SetupStep.SIGNATURE: return "Assinatura Digital";
      case SetupStep.PREVIEW: return "Revisão do Contrato";
      default: return "Configurar Contratos";
    }
  };

  const handleFinalSubmit = async (active: boolean) => {
    if (!profile?.id) return;
    setIsSubmitting(true);
    try {
      let signatureUrl = signatureTemp || profile.assinatura_digital_url;
      if (active && (step === SetupStep.SIGNATURE || step === SetupStep.PREVIEW)) {
        if (sigPad.current && !sigPad.current.isEmpty()) {
          signatureUrl = sigPad.current.toDataURL("image/png");
        }
      }
      const finalClausulas = clausulas.filter((c) => c.trim() !== "");
      await usuarioApi.atualizarUsuario(profile.id, {
        assinatura_digital_url: signatureUrl,
        config_contrato: {
          usar_contratos: active,
          configurado: true,
          multa_atraso: multaAtraso,
          multa_rescisao: multaRescisao,
          clausulas: finalClausulas,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      await refreshProfile();
      if (onSuccess) onSuccess(active);
      onClose();
      toast.success("Configurações salvas com sucesso!");
    } catch (err) {
      toast.error("erro.salvar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderWelcome = () => (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-black text-[#1a3a5c] uppercase tracking-tight">Contratos Automáticos</h2>
        <p className="text-[11px] text-slate-500 leading-relaxed px-4 italic font-medium">
          O sistema gera o contrato, envia para o responsável e solicita a assinatura digital, para cada passageiro cadastrado.
        </p>
      </div>
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => setUsarContratos(true)}
          className={cn(
            "w-full p-4 sm:p-5 rounded-[2rem] border transition-all flex items-center gap-4 active:scale-[0.98] group shadow-sm",
            usarContratos
              ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-200 shadow-lg shadow-emerald-500/5"
              : "border-slate-100 bg-white hover:border-slate-200"
          )}
        >
          <div className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm",
            usarContratos ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100"
          )}>
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className={cn("text-[13px] font-black uppercase tracking-tight", usarContratos ? "text-emerald-900" : "text-slate-600")}>
              Usar Contratos
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide italic">PDF automático e digital</p>
          </div>
          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", usarContratos ? "border-emerald-500 bg-emerald-500" : "border-slate-300")}>
            {usarContratos && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setUsarContratos(false)}
          className={cn(
            "w-full p-4 sm:p-5 rounded-[2rem] border transition-all flex items-center gap-4 active:scale-[0.98] group shadow-sm",
            !usarContratos
              ? "border-slate-400 bg-slate-50 ring-1 ring-slate-200 shadow-lg shadow-slate-200/5"
              : "border-slate-100 bg-white hover:border-slate-200"
          )}
        >
          <div className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm",
            !usarContratos ? "bg-slate-400 text-white shadow-lg shadow-slate-200" : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100"
          )}>
            <FileText className="w-6 h-6 opacity-30" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className={cn("text-[13px] font-black uppercase tracking-tight", !usarContratos ? "text-slate-900" : "text-slate-500")}>
              Não usar contratos
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide italic">Você poderá ativar depois</p>
          </div>
          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", !usarContratos ? "border-slate-400 bg-slate-400" : "border-slate-300")}>
            {!usarContratos && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
        </button>
      </div>

      <AnimatePresence>
        {!usarContratos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/60 flex gap-3 items-start shadow-sm"
          >
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-900 leading-relaxed italic font-medium">
              A qualquer momento você poderá ativar as configurações de contrato na tela de contratos.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderFees = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#1a3a5c]" />
          <h3 className="font-black text-xs uppercase tracking-wider text-[#1a3a5c]">Penalidades e Multas</h3>
        </div>
        <p className="text-[10px] text-slate-400 ml-7 italic font-medium">
          Defina as penalidades padrão que constarão nas cláusulas dos seus contratos.
        </p>
      </div>
      <div className="space-y-4">
        {[
          {
            label: "Multa por Atraso",
            desc: "Aplicada sobre o valor da mensalidade em caso de atraso no pagamento.",
            state: multaAtraso,
            setState: setMultaAtraso,
            dotColor: "bg-[#1a3a5c]",
            simLabel: "Simulação: R$ 200,00",
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
            dotColor: "bg-red-400",
            simLabel: "Se o plano anual for R$ 2.400,00",
            simValue:
              multaRescisao.tipo === "percentual"
                ? (2400 * (multaRescisao.valor / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : multaRescisao.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
            simColor: "text-red-500",
          },
        ].map(({ label, desc, state, setState, dotColor, simLabel, simValue, simColor }) => (
          <div key={label} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100/60 space-y-4 shadow-sm">
            <div>
              <Label className="text-[#1a3a5c] font-black text-[10px] uppercase tracking-wider flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full shadow-sm", dotColor)} />
                {label}
              </Label>
              <p className="text-[10px] text-slate-400 mt-1 italic pl-4 font-medium">{desc}</p>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                value={state.valor}
                onChange={(e) => setState({ ...state, valor: Number(e.target.value) })}
                className="flex-1 h-12 rounded-2xl bg-white border-slate-200 focus:ring-4 focus:ring-[#1a3a5c]/10 text-center font-black text-lg text-[#1a3a5c]"
              />
              <Select
                value={state.tipo}
                onValueChange={(v: "percentual" | "fixo") => setState({ ...state, tipo: v })}
              >
                <SelectTrigger className="w-36 h-12 rounded-2xl bg-white border-slate-200 font-bold text-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentual" className="font-bold">Porcentagem (%)</SelectItem>
                  <SelectItem value="fixo" className="font-bold">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-[10px] bg-white text-slate-600 px-4 py-3 rounded-2xl flex justify-between items-center border border-slate-100 shadow-sm">
              <span className="font-bold italic opacity-60 uppercase tracking-wider">{simLabel}</span>
              <strong className={cn("text-xs font-black", simColor)}>{simValue}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClauses = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[#1a3a5c]">
          <PenTool className="w-5 h-5 opacity-80" />
          <h3 className="font-black text-xs uppercase tracking-wider">Cláusulas e Termos</h3>
        </div>
        <div className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200/50">
          {clausulas.length} {clausulas.length === 1 ? "Item" : "Itens"}
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
        <h3 className="font-black text-[#1a3a5c] text-lg uppercase tracking-tight">Assinatura Digital</h3>
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
        <h3 className="text-lg font-black text-[#1a3a5c] uppercase tracking-tight">Revise as configurações</h3>
        <p className="text-[10px] text-slate-500 italic font-medium px-4 leading-relaxed">Só confirme após revisar as configurações.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-slate-50 rounded-3xl border border-slate-100/60 flex flex-col items-center text-center">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-200/50 pb-0.5 w-full text-center">Multa Atraso</p>
          <p className="text-xs font-semibold text-[#1a3a5c] tracking-tight">
            {multaAtraso.tipo === "percentual" ? `${multaAtraso.valor}%` : `R$ ${multaAtraso.valor}`}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-3xl border border-slate-100/60 flex flex-col items-center text-center">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-200/50 pb-0.5 w-full text-center">Multa Rescisão</p>
          <p className="text-xs font-semibold text-red-500 tracking-tight">
            {multaRescisao.tipo === "percentual" ? `${multaRescisao.valor}%` : `R$ ${multaRescisao.valor}`}
          </p>
        </div>
        <div className="col-span-2 p-3 bg-slate-50 rounded-3xl border border-slate-100/60 flex items-center justify-between">
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cláusulas</p>
            <p className="text-[10px] font-semibold text-[#1a3a5c] uppercase">{clausulas.filter((c) => c.trim()).length} itens ativos</p>
          </div>
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
            } catch (err) {}
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

  const podeFechar = !!profile?.config_contrato?.configurado;
  const canCloseNow = podeFechar || (step === SetupStep.WELCOME && !usarContratos);

  return (
    <>
      <BaseDialog
        open={isOpen}
        onOpenChange={(open) => { if (!open && canCloseNow) onClose(); }}
        lockClose={!canCloseNow}
      >
        <BaseDialog.Header
          title={currentStepTitle()}
          icon={<FileText className="w-5 h-5 opacity-80" />}
          showSteps
          currentStep={step + 1}
          totalSteps={5}
          hideCloseButton={!podeFechar}
          onClose={podeFechar ? onClose : undefined}
        />
        <BaseDialog.Body animate animationKey={step} className="min-h-[300px]">
          {step === SetupStep.WELCOME && renderWelcome()}
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
              step === SetupStep.PREVIEW || (step === SetupStep.WELCOME && !usarContratos)
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
