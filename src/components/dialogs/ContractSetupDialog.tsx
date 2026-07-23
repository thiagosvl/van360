import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { SignaturePad, SignaturePadRef } from "@/components/common/SignaturePad";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_CLAUSULAS_CONTRATO } from "@/constants/defaults";
import { usePreviewContrato } from "@/hooks/api/useContratos";
import { useProfile } from "@/hooks/business/useProfile";
import { cn } from "@/lib/utils";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { useLayout } from "@/contexts/LayoutContext";
import { usuarioApi } from "@/services/api/usuario.api";
import { queryClient } from "@/services/queryClient";
import { ContractMultaTipo } from "@/types/enums";
import { toast } from "@/utils/notifications/toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  DollarSign,
  FileText,
  Loader2,
  PenTool,
  Plus,
  Trash2,
  Timer,
  Scale,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

const SETUP_STEPS = [
  { id: SetupStep.FEES, label: "Multas" },
  { id: SetupStep.CLAUSES, label: "Cláusulas" },
  { id: SetupStep.SIGNATURE, label: "Assinatura" },
  { id: SetupStep.PREVIEW, label: "Revisão" },
];

export default function ContractSetupDialog({ isOpen, onClose, onSuccess }: ContractSetupDialogProps) {
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { profile, refreshProfile } = useProfile();
  const [step, setStep] = useState<SetupStep>(SetupStep.FEES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const previewMutation = usePreviewContrato();

  const [multaAtraso, setMultaAtraso] = useState<{ valor: number; tipo: ContractMultaTipo }>({
    valor: 10,
    tipo: ContractMultaTipo.FIXO,
  });
  const [jurosAtraso, setJurosAtraso] = useState<{ valor: number; tipo: ContractMultaTipo }>({
    valor: 1,
    tipo: ContractMultaTipo.PERCENTUAL,
  });
  const [multaRescisao, setMultaRescisao] = useState<{ valor: number; tipo: ContractMultaTipo }>({
    valor: 15,
    tipo: ContractMultaTipo.FIXO,
  });
  const [clausulas, setClausulas] = useState<string[]>([]);
  const [expandedClauseIdx, setExpandedClauseIdx] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const clauseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const hasConfiguredBefore = Boolean(profile?.assinatura_digital_url);

  useLayoutEffect(() => {
    setExpandedClauseIdx(null);
    const scrollFn = () => {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    };
    scrollFn();
    const timer = setTimeout(scrollFn, 20);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (expandedClauseIdx !== null && step === SetupStep.CLAUSES) {
      const scrollFn = () => {
        const el = clauseRefs.current[expandedClauseIdx];
        const container = bodyRef.current;
        if (el && container) {
          let topOffset = 0;
          let current: HTMLElement | null = el;
          while (current && current !== container && container.contains(current)) {
            topOffset += current.offsetTop;
            current = current.offsetParent as HTMLElement | null;
          }
          const offsetMargin = hasConfiguredBefore ? 12 : 110;
          container.scrollTo({
            top: Math.max(0, topOffset - offsetMargin),
            behavior: "smooth",
          });
        }
      };

      const timer1 = setTimeout(scrollFn, 20);
      const timer2 = setTimeout(scrollFn, 180);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [expandedClauseIdx, hasConfiguredBefore]);

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
        setMultaAtraso(isDefault ? { ...profile.config_contrato.multa_atraso, tipo: ContractMultaTipo.FIXO } : profile.config_contrato.multa_atraso);
      }
      if (profile.config_contrato?.juros_atraso) {
        setJurosAtraso(isDefault ? { ...profile.config_contrato.juros_atraso, tipo: ContractMultaTipo.PERCENTUAL } : profile.config_contrato.juros_atraso);
      }
      if (profile.config_contrato?.multa_rescisao) {
        setMultaRescisao(isDefault ? { ...profile.config_contrato.multa_rescisao, tipo: ContractMultaTipo.FIXO } : profile.config_contrato.multa_rescisao);
      }
      if (profile.assinatura_digital_url && !signatureTemp) setSignatureTemp(profile.assinatura_digital_url);

      setStep(SetupStep.FEES);
      setExpandedClauseIdx(null);

      initializedRef.current = true;
    }
  }, [isOpen, profile, signatureTemp]);

  const hasDrawing = sigPad.current ? !sigPad.current.isEmpty() : false;
  const hasSignature = signatureTemp === null
    ? hasDrawing
    : Boolean(signatureTemp || profile?.assinatura_digital_url || hasDrawing);

  const handleStepClick = (targetStep: SetupStep) => {
    if (targetStep === SetupStep.PREVIEW && !hasSignature) {
      toast.error("validacao.campoObrigatorio");
      return;
    }
    setStep(targetStep);
  };

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
      const currentSig = captureSignature();
      if (!currentSig) {
        toast.error("validacao.campoObrigatorio");
        return;
      }
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
          juros_atraso: jurosAtraso,
          multa_rescisao: multaRescisao,
          clausulas: finalClausulas,
        },
      });
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
            multaAtraso.tipo === ContractMultaTipo.PERCENTUAL
              ? (200 * (1 + multaAtraso.valor / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : (200 + multaAtraso.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          simColor: "text-[#1a3a5c]",
        },
        {
          label: "Juros por Atraso",
          desc: "Cobrado sobre a parcela pelo tempo de atraso (geralmente 1% ao mês).",
          state: jurosAtraso,
          setState: setJurosAtraso,
          icon: Timer,
          iconColor: "text-[#1a3a5c]",
          simBaseLabel: "Exemplo Parcela",
          simResultLabel: jurosAtraso.tipo === ContractMultaTipo.PERCENTUAL ? "Juros p/ mês" : "Juros p/ dia",
          simBaseValue: 200,
          simValue:
            jurosAtraso.tipo === ContractMultaTipo.PERCENTUAL
              ? (200 * (jurosAtraso.valor / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : jurosAtraso.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
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
            multaRescisao.tipo === ContractMultaTipo.PERCENTUAL
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
                  onClick={() => setState({ ...state, tipo: ContractMultaTipo.FIXO })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[11px] font-black transition-all",
                    state.tipo === ContractMultaTipo.FIXO
                      ? "bg-white text-[#1a3a5c] shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Valor Fixo (R$)
                </button>
                <button
                  type="button"
                  onClick={() => setState({ ...state, tipo: ContractMultaTipo.PERCENTUAL })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[11px] font-black transition-all",
                    state.tipo === ContractMultaTipo.PERCENTUAL
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
                  inputMode={state.tipo === ContractMultaTipo.PERCENTUAL ? "decimal" : "numeric"}
                  value={state.tipo === ContractMultaTipo.PERCENTUAL ? (state.valor === 0 ? "" : state.valor.toString().replace('.', ',')) : (state.valor === 0 ? "" : moneyMask(state.valor))}
                  onChange={(e) => {
                    if (state.tipo === ContractMultaTipo.PERCENTUAL) {
                      const val = e.target.value.replace(',', '.').replace(/[^\d.]/g, '');
                      const parts = val.split('.');
                      const cleanVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : val;
                      if (cleanVal === '' || cleanVal === '.') {
                        setState({ ...state, valor: 0 });
                      } else {
                        const numVal = parseFloat(cleanVal);
                        setState({ ...state, valor: isNaN(numVal) ? 0 : numVal });
                      }
                    } else {
                      const val = moneyMask(e.target.value);
                      const numVal = moneyToNumber(val);
                      setState({ ...state, valor: numVal });
                    }
                  }}
                  className={cn(
                    "w-full h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/5 font-black text-base text-[#1a3a5c] pl-4",
                    state.tipo === ContractMultaTipo.PERCENTUAL ? "pr-10 text-left" : "pr-4 text-left"
                  )}
                  placeholder={state.tipo === ContractMultaTipo.PERCENTUAL ? "0" : "R$ 0,00"}
                />
                {state.tipo === ContractMultaTipo.PERCENTUAL && (
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
                  {state.tipo === ContractMultaTipo.PERCENTUAL
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

  const handleDeleteClausula = (idx: number) => {
    const isBlank = clausulas[idx]?.trim() === "";

    const executeDelete = () => {
      const newClausulas = clausulas.filter((_, i) => i !== idx);
      setClausulas(newClausulas);
      if (expandedClauseIdx === idx) {
        setExpandedClauseIdx(newClausulas.length > 0 ? Math.min(idx, newClausulas.length - 1) : null);
      } else if (expandedClauseIdx !== null && expandedClauseIdx > idx) {
        setExpandedClauseIdx(expandedClauseIdx - 1);
      }
    };

    if (isBlank) {
      executeDelete();
      return;
    }

    openConfirmationDialog({
      title: "Excluir Cláusula?",
      description: `Tem certeza que deseja excluir a Cláusula ${idx + 1}? Esta ação não poderá ser desfeita.`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: () => {
        executeDelete();
        closeConfirmationDialog();
      },
    });
  };

  const renderClauses = () => (
    <div className="space-y-4">
      {hasConfiguredBefore ? (
        <div className="flex items-center justify-end px-1">
          <div className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200/50">
            {clausulas.length} {clausulas.length === 1 ? "Cláusula" : "Cláusulas"}
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
            Não se preocupe! Você poderá editar as cláusulas a qualquer momento.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {clausulas.map((clausula, idx) => {
          const isExpanded = expandedClauseIdx === idx;
          const hasError = showErrors && clausula.trim() === "";

          return (
            <motion.div
              key={idx}
              ref={(el) => {
                clauseRefs.current[idx] = el;
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-3xl border transition-all overflow-hidden shadow-sm scroll-mt-4",
                hasError
                  ? "border-red-200 bg-red-50/30"
                  : isExpanded
                    ? "border-[#1a3a5c]/30 bg-white ring-2 ring-[#1a3a5c]/5 shadow-md"
                    : "border-slate-100 bg-white hover:border-slate-200"
              )}
            >
              <div
                onClick={() => setExpandedClauseIdx(isExpanded ? null : idx)}
                className="px-5 py-4 cursor-pointer select-none group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border shrink-0 transition-colors",
                      isExpanded
                        ? "bg-[#1a3a5c] text-white border-[#1a3a5c]"
                        : "bg-slate-50 text-[#1a3a5c]/70 border-slate-100"
                    )}
                  >
                    CLÁUSULA {idx + 1}
                  </span>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setExpandedClauseIdx(isExpanded ? null : idx)}
                      className="p-1.5 text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 rounded-xl transition-all active:scale-95"
                      title={isExpanded ? "Recolher" : "Expandir para editar"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#1a3a5c]" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClausula(idx)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                      title="Excluir cláusula"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!isExpanded && (
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 italic leading-relaxed pt-0.5">
                    {clausula.trim() ? clausula : "Cláusula em branco..."}
                  </p>
                )}
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-100/60">
                  <textarea
                    className={cn(
                      "w-full p-4 text-xs sm:text-[13px] bg-slate-50/60 border border-slate-200/80 rounded-2xl focus:bg-white focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/5 resize-none leading-relaxed placeholder:text-slate-300 font-medium transition-all min-h-[300px] sm:min-h-[380px] h-[calc(100dvh-320px)] max-h-[500px]",
                      hasError ? "text-red-900 border-red-200 placeholder:text-red-300" : "text-slate-700"
                    )}
                    value={clausula}
                    rows={12}
                    autoFocus={clausula.trim() === ""}
                    onChange={(e) => {
                      const newClausulas = [...clausulas];
                      newClausulas[idx] = e.target.value;
                      setClausulas(newClausulas);
                    }}
                    placeholder="Ex: O transporte será realizado exclusivamente em dias úteis..."
                  />
                  {hasError && (
                    <p className="text-xs text-red-500">Campo obrigatório</p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
        <Button
          variant="outline"
          className="w-full h-14 border-dashed border-2 border-slate-200 text-[#1a3a5c] bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 rounded-[2rem] group transition-all active:scale-[0.98] font-black uppercase text-[10px] tracking-wider"
          onClick={() => {
            setClausulas([...clausulas, ""]);
            setExpandedClauseIdx(clausulas.length);
          }}
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
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 bg-slate-50 rounded-3xl border border-slate-100/60 flex flex-col items-center text-center">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Multa Atraso</p>
          <p className="text-sm font-black text-[#1a3a5c] tracking-tight">
            {multaAtraso.tipo === ContractMultaTipo.PERCENTUAL ? `${multaAtraso.valor}%` : moneyMask(multaAtraso.valor)}
          </p>
        </div>
        <div className="p-3.5 bg-slate-50 rounded-3xl border border-slate-100/60 flex flex-col items-center text-center">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Juros Atraso</p>
          <p className="text-sm font-black text-[#1a3a5c] tracking-tight">
            {jurosAtraso.tipo === ContractMultaTipo.PERCENTUAL ? `${jurosAtraso.valor}%` : moneyMask(jurosAtraso.valor)}
          </p>
        </div>
        <div className="p-3.5 bg-slate-50 rounded-3xl border border-slate-100/60 flex flex-col items-center text-center">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Multa Rescisão</p>
          <p className="text-sm font-black text-[#1a3a5c] tracking-tight">
            {multaRescisao.tipo === ContractMultaTipo.PERCENTUAL ? `${multaRescisao.valor}%` : moneyMask(multaRescisao.valor)}
          </p>
        </div>
        <div className="p-3.5 bg-slate-50 rounded-3xl border border-slate-100/60 flex flex-col items-center text-center">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cláusulas</p>
          <p className="text-sm font-black text-[#1a3a5c] uppercase">{clausulas.filter((c) => c.trim()).length}</p>
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
                jurosAtraso,
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
        <BaseDialog.Body containerRef={bodyRef} className="min-h-[300px]">
          {hasConfiguredBefore && (
            <div className="flex gap-2 bg-transparent p-0 justify-start overflow-x-auto h-auto no-scrollbar scrollbar-none pb-2 mb-4 shrink-0">
              {SETUP_STEPS.map((s) => {
                const isDisabled = s.id === SetupStep.PREVIEW && !hasSignature;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleStepClick(s.id)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all shadow-sm shrink-0 whitespace-nowrap",
                      step === s.id
                        ? "bg-[#1a3a5c] text-white border-[#1a3a5c]"
                        : isDisabled
                          ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}
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
                : "Avançar"
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
