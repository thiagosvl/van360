import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { SignaturePad, SignaturePadRef } from "@/components/common/SignaturePad";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractSection, DEFAULT_SECOES_CONTRATO } from "@/constants/defaults";
import { usePreviewContrato } from "@/hooks/api/useContratos";
import { useProfile } from "@/hooks/business/useProfile";
import { cn } from "@/lib/utils";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { useLayout } from "@/contexts/LayoutContext";
import { usuarioApi } from "@/services/api/usuario.api";
import { ContractMultaTipo } from "@/types/enums";
import { toast } from "@/utils/notifications/toast";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Eraser,
  FileText,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Scale,
  Timer,
  Trash2,
} from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

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

interface ClauseItemUI {
  id: string;
  texto: string;
}

interface ContractSectionUI {
  id: string;
  titulo: string;
  clausulas: ClauseItemUI[];
}

function toSectionUI(secao: ContractSection, sIdx: number): ContractSectionUI {
  const secId = secao.id || `secao-${sIdx}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: secId,
    titulo: secao.titulo,
    clausulas: (secao.clausulas || []).map((c, cIdx) => ({
      id: `clause-${secId}-${cIdx}-${Math.random().toString(36).substring(2, 7)}`,
      texto: c,
    })),
  };
}

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

  const [secoes, setSecoes] = useState<ContractSectionUI[]>([]);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [expandedClauseKey, setExpandedClauseKey] = useState<string | null>(null);
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const clauseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const hasConfiguredBefore = Boolean(profile?.assinatura_digital_url);

  useLayoutEffect(() => {
    setExpandedClauseKey(null);
    const scrollFn = () => {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    };
    scrollFn();
    const timer = setTimeout(scrollFn, 20);
    return () => clearTimeout(timer);
  }, [step]);

  // Scroll automático suave ao expandir uma cláusula
  useEffect(() => {
    if (expandedClauseKey !== null && step === SetupStep.CLAUSES) {
      const scrollFn = () => {
        const el = clauseRefs.current[expandedClauseKey];
        const container = bodyRef.current;
        if (el && container) {
          let topOffset = 0;
          let current: HTMLElement | null = el;
          while (current && current !== container && container.contains(current)) {
            topOffset += current.offsetTop;
            current = current.offsetParent as HTMLElement | null;
          }
          const offsetMargin = hasConfiguredBefore ? 90 : 60;
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
  }, [expandedClauseKey, hasConfiguredBefore, step]);

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
      let loadedSecoes: ContractSectionUI[] = [];
      if (profile.config_contrato?.secoes && profile.config_contrato.secoes.length > 0) {
        loadedSecoes = profile.config_contrato.secoes.map((s, idx) => toSectionUI(s, idx));
      } else if (profile.config_contrato?.clausulas && profile.config_contrato.clausulas.length > 0) {
        loadedSecoes = [
          toSectionUI(
            {
              id: "secao-prestacao",
              titulo: "DA PRESTAÇÃO DO SERVIÇO",
              clausulas: profile.config_contrato.clausulas,
            },
            0
          ),
        ];
      } else {
        loadedSecoes = DEFAULT_SECOES_CONTRATO.map((s, idx) => toSectionUI(s, idx));
      }
      setSecoes(loadedSecoes);
      setExpandedSectionId(null);

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
      setExpandedClauseKey(null);
      setFocusedSectionId(null);

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

  // Handlers para Seções e Cláusulas
  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    setSecoes((prev) => prev.map((sec) => (sec.id === sectionId ? { ...sec, titulo: newTitle } : sec)));
  };

  const handleAddClauseToSection = (sectionId: string) => {
    const newClauseId = `clause-${sectionId}-${Date.now()}`;
    setSecoes((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          const updatedClauses = [...sec.clausulas, { id: newClauseId, texto: "" }];
          setExpandedClauseKey(newClauseId);
          return { ...sec, clausulas: updatedClauses };
        }
        return sec;
      })
    );
    setExpandedSectionId(sectionId);
  };

  const handleClauseChange = (sectionId: string, clauseId: string, text: string) => {
    setSecoes((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          const updated = sec.clausulas.map((c) => (c.id === clauseId ? { ...c, texto: text } : c));
          return { ...sec, clausulas: updated };
        }
        return sec;
      })
    );
  };

  const handleDeleteClause = (sectionId: string, clauseId: string) => {
    const targetSecao = secoes.find((s) => s.id === sectionId);
    const clauseItem = targetSecao?.clausulas.find((c) => c.id === clauseId);
    const text = clauseItem?.texto ?? "";

    const executeDelete = () => {
      setSecoes((prev) =>
        prev.map((sec) => {
          if (sec.id === sectionId) {
            const updated = sec.clausulas.filter((c) => c.id !== clauseId);
            return { ...sec, clausulas: updated };
          }
          return sec;
        })
      );
      if (expandedClauseKey === clauseId) {
        setExpandedClauseKey(null);
      }
    };

    if (!text.trim()) {
      executeDelete();
      return;
    }

    openConfirmationDialog({
      title: "Excluir Cláusula?",
      description: "Tem certeza que deseja excluir esta cláusula? Esta ação não poderá ser desfeita.",
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: () => {
        executeDelete();
        closeConfirmationDialog();
      },
    });
  };

  // Ao clicar em Nova Seção: gera a nova seção com 1 cláusula inicial em branco
  const handleAddSection = () => {
    const newSecaoId = `secao-${Date.now()}`;
    const newClauseId = `clause-${newSecaoId}-0`;
    const newSecao: ContractSectionUI = {
      id: newSecaoId,
      titulo: "",
      clausulas: [{ id: newClauseId, texto: "" }],
    };
    setSecoes((prev) => [...prev, newSecao]);
    setExpandedSectionId(newSecaoId);
    setExpandedClauseKey(null);
    setFocusedSectionId(newSecaoId);
  };

  const handleDeleteSection = (sectionId: string) => {
    const targetSecao = secoes.find((s) => s.id === sectionId);
    const hasContent = targetSecao?.clausulas.some((c) => c.texto.trim() !== "") || Boolean(targetSecao?.titulo.trim());

    const executeDelete = () => {
      setSecoes((prev) => prev.filter((s) => s.id !== sectionId));
      if (expandedSectionId === sectionId) {
        setExpandedSectionId(null);
      }
    };

    if (!hasContent) {
      executeDelete();
      return;
    }

    openConfirmationDialog({
      title: "Excluir Seção Inteira?",
      description: `Tem certeza que deseja excluir a seção "${targetSecao?.titulo || 'Nova Seção'}" e todas as suas cláusulas?`,
      confirmText: "Excluir Seção",
      variant: "destructive",
      onConfirm: () => {
        executeDelete();
        closeConfirmationDialog();
      },
    });
  };

  // --- HANDLERS DE REORDENAÇÃO VIA SETAS ---
  const handleMoveSectionUp = (sIdx: number) => {
    if (sIdx <= 0) return;
    setSecoes((prev) => {
      const next = [...prev];
      const temp = next[sIdx];
      next[sIdx] = next[sIdx - 1];
      next[sIdx - 1] = temp;
      return next;
    });
  };

  const handleMoveSectionDown = (sIdx: number) => {
    if (sIdx >= secoes.length - 1) return;
    setSecoes((prev) => {
      const next = [...prev];
      const temp = next[sIdx];
      next[sIdx] = next[sIdx + 1];
      next[sIdx + 1] = temp;
      return next;
    });
  };

  const handleMoveClauseUp = (sIdx: number, cIdx: number) => {
    if (sIdx === 0 && cIdx === 0) return;
    setSecoes((prev) => {
      const next = prev.map((s) => ({ ...s, clausulas: [...s.clausulas] }));
      const currentSec = next[sIdx];
      const clauseToMove = currentSec.clausulas[cIdx];

      if (cIdx > 0) {
        // Mover dentro da mesma seção
        currentSec.clausulas.splice(cIdx, 1);
        currentSec.clausulas.splice(cIdx - 1, 0, clauseToMove);
      } else {
        // Mover para o final da seção anterior
        const prevSec = next[sIdx - 1];
        currentSec.clausulas.splice(cIdx, 1);
        prevSec.clausulas.push(clauseToMove);
        setExpandedSectionId(prevSec.id);
      }
      return next;
    });
  };

  const handleMoveClauseDown = (sIdx: number, cIdx: number) => {
    const currentSec = secoes[sIdx];
    if (sIdx === secoes.length - 1 && cIdx === currentSec.clausulas.length - 1) return;

    setSecoes((prev) => {
      const next = prev.map((s) => ({ ...s, clausulas: [...s.clausulas] }));
      const sec = next[sIdx];
      const clauseToMove = sec.clausulas[cIdx];

      if (cIdx < sec.clausulas.length - 1) {
        // Mover dentro da mesma seção
        sec.clausulas.splice(cIdx, 1);
        sec.clausulas.splice(cIdx + 1, 0, clauseToMove);
      } else {
        // Mover para o início da próxima seção
        const nextSec = next[sIdx + 1];
        sec.clausulas.splice(cIdx, 1);
        nextSec.clausulas.unshift(clauseToMove);
        setExpandedSectionId(nextSec.id);
      }
      return next;
    });
  };

  const cleanSecoesDTO: ContractSection[] = secoes
    .map((sec) => ({
      id: sec.id,
      titulo: sec.titulo.trim().toUpperCase(),
      clausulas: sec.clausulas.map((c) => c.texto.trim()).filter((t) => t !== ""),
    }))
    .filter((sec) => sec.clausulas.length > 0);

  const flatClausulas = cleanSecoesDTO.flatMap((sec) => sec.clausulas);
  const totalClausulas = secoes.reduce((acc, s) => acc + s.clausulas.length, 0);

  const handleNext = () => {
    if (step === SetupStep.CLAUSES) {
      const emptyTitleSecao = secoes.find((s) => s.titulo.trim() === "");
      if (emptyTitleSecao) {
        setShowErrors(true);
        setExpandedSectionId(emptyTitleSecao.id);
        setFocusedSectionId(emptyTitleSecao.id);
        toast.error("Informe o título de todas as seções.");
        return;
      }

      const emptySecao = secoes.find((s) => s.clausulas.length === 0 || !s.clausulas.some((c) => c.texto.trim() !== ""));
      if (emptySecao) {
        setShowErrors(true);
        setExpandedSectionId(emptySecao.id);
        toast.error(`A seção "${emptySecao.titulo}" precisa ter pelo menos 1 cláusula preenchida.`);
        return;
      }

      const hasBlankClause = secoes.some((s) => s.clausulas.some((c) => c.texto.trim() === ""));
      if (hasBlankClause) {
        setShowErrors(true);
        const sectionWithBlank = secoes.find((s) => s.clausulas.some((c) => c.texto.trim() === ""));
        if (sectionWithBlank) setExpandedSectionId(sectionWithBlank.id);
        toast.error("Preencha ou remova as cláusulas em branco antes de avançar.");
        return;
      }

      setShowErrors(false);
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

      const emptyTitleSecao = secoes.find((s) => s.titulo.trim() === "");
      if (emptyTitleSecao) {
        setShowErrors(true);
        setExpandedSectionId(emptyTitleSecao.id);
        setFocusedSectionId(emptyTitleSecao.id);
        toast.error("Informe o título de todas as seções.");
        setStep(SetupStep.CLAUSES);
        setIsSubmitting(false);
        return;
      }

      const emptySecao = secoes.find((s) => s.clausulas.length === 0 || !s.clausulas.some((c) => c.texto.trim() !== ""));
      if (emptySecao) {
        setShowErrors(true);
        setExpandedSectionId(emptySecao.id);
        toast.error(`A seção "${emptySecao.titulo}" precisa ter pelo menos 1 cláusula preenchida.`);
        setStep(SetupStep.CLAUSES);
        setIsSubmitting(false);
        return;
      }

      await usuarioApi.atualizarUsuario(profile.id, {
        assinatura_digital_url: signatureUrl,
        config_contrato: {
          usar_contratos: true,
          multa_atraso: multaAtraso,
          juros_atraso: jurosAtraso,
          multa_rescisao: multaRescisao,
          secoes: cleanSecoesDTO,
          clausulas: flatClausulas,
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

  const renderClauses = () => (
    <div className="space-y-4">
      {hasConfiguredBefore ? (
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
            Estrutura do Contrato
          </span>
          <div className="flex gap-1.5">
            <span className="px-2 py-0.5 sm:px-2.5 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200/50">
              {secoes.length} {secoes.length === 1 ? "Seção" : "Seções"}
            </span>
            <span className="px-2 py-0.5 sm:px-2.5 bg-blue-50 rounded-full text-[9px] font-black text-blue-600 uppercase tracking-widest border border-blue-100">
              {totalClausulas} {totalClausulas === 1 ? "Cláusula" : "Cláusulas"}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 sm:p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 flex gap-2.5 sm:gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-[11px] text-blue-800 leading-relaxed font-medium">
            Não se preocupe! Você poderá editar seu contrato a qualquer momento no futuro.
          </p>
        </div>
      )}

      {/* Botão de Visualizar Modelo no topo das Cláusulas */}
      <Button
        variant="outline"
        type="button"
        className="w-full h-11 border border-slate-200 text-[#1a3a5c] hover:bg-slate-50 rounded-2xl font-black uppercase text-[10px] tracking-widest group transition-all active:scale-[0.98] shadow-sm"
        disabled={previewMutation.isPending}
        onClick={async () => {
          try {
            const result = await previewMutation.mutateAsync({
              secoes: cleanSecoesDTO,
              clausulas: flatClausulas,
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
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <FileText className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform opacity-70" />
        )}
        Visualizar Modelo
      </Button>

      {/* Lista de Seções */}
      <div className="space-y-4">
        {secoes.map((secao, sIdx) => (
          <SectionItemCard
            key={secao.id}
            secao={secao}
            sIdx={sIdx}
            totalSections={secoes.length}
            showErrors={showErrors}
            isSectionExpanded={expandedSectionId === secao.id}
            onToggleExpandSection={() => setExpandedSectionId(expandedSectionId === secao.id ? null : secao.id)}
            focusedSectionId={focusedSectionId}
            setFocusedSectionId={setFocusedSectionId}
            expandedClauseKey={expandedClauseKey}
            setExpandedClauseKey={setExpandedClauseKey}
            clauseRefs={clauseRefs}
            onSectionTitleChange={handleSectionTitleChange}
            onDeleteSection={handleDeleteSection}
            onMoveSectionUp={handleMoveSectionUp}
            onMoveSectionDown={handleMoveSectionDown}
            onMoveClauseUp={handleMoveClauseUp}
            onMoveClauseDown={handleMoveClauseDown}
            onClauseChange={(clauseId, text) => handleClauseChange(secao.id, clauseId, text)}
            onDeleteClause={(clauseId) => handleDeleteClause(secao.id, clauseId)}
            onAddClause={() => handleAddClauseToSection(secao.id)}
          />
        ))}
      </div>

      {/* Botão de Adicionar Nova Seção */}
      <button
        type="button"
        onClick={handleAddSection}
        className="w-full py-3 bg-white border-2 border-dashed border-slate-300 hover:bg-blue-50/50 hover:border-blue-400 text-[#1a3a5c] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
      >
        <FolderPlus className="w-4 h-4 text-blue-600" />
        Adicionar Nova Seção ao Contrato
      </button>
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
          <p className="text-sm font-black text-[#1a3a5c] uppercase">{flatClausulas.length}</p>
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
                secoes: cleanSecoesDTO,
                clausulas: flatClausulas,
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
                        ? "bg-[#1a3a5c] text-[#ffffff] border-[#1a3a5c]"
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

// Componente para a Seção com Reordenação por Setas
interface SectionItemCardProps {
  secao: ContractSectionUI;
  sIdx: number;
  totalSections: number;
  showErrors: boolean;
  isSectionExpanded: boolean;
  onToggleExpandSection: () => void;
  focusedSectionId: string | null;
  setFocusedSectionId: (id: string | null) => void;
  expandedClauseKey: string | null;
  setExpandedClauseKey: (key: string | null) => void;
  clauseRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onSectionTitleChange: (sectionId: string, newTitle: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSectionUp: (sIdx: number) => void;
  onMoveSectionDown: (sIdx: number) => void;
  onMoveClauseUp: (sIdx: number, cIdx: number) => void;
  onMoveClauseDown: (sIdx: number, cIdx: number) => void;
  onClauseChange: (clauseId: string, text: string) => void;
  onDeleteClause: (clauseId: string) => void;
  onAddClause: () => void;
}

function SectionItemCard({
  secao,
  sIdx,
  totalSections,
  showErrors,
  isSectionExpanded,
  onToggleExpandSection,
  focusedSectionId,
  setFocusedSectionId,
  expandedClauseKey,
  setExpandedClauseKey,
  clauseRefs,
  onSectionTitleChange,
  onDeleteSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onMoveClauseUp,
  onMoveClauseDown,
  onClauseChange,
  onDeleteClause,
  onAddClause,
}: SectionItemCardProps) {
  const isSecaoEmpty = secao.clausulas.length === 0;
  const isTitleEmpty = secao.titulo.trim() === "";

  return (
    <div
      className={cn(
        "p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border shadow-sm space-y-3.5 transition-all",
        showErrors && (isSecaoEmpty || isTitleEmpty) ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
      )}
    >
      {/* Header da Seção */}
      <div className={cn("space-y-1.5", isSectionExpanded ? "border-b border-slate-100 pb-3" : "")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5 flex-1 min-w-0">
            {/* Setas de Reordenação da Seção (Empilhadas - apenas quando recolhida) */}
            {!isSectionExpanded && (
              <div className="flex flex-col items-center justify-center -space-y-0.5 shrink-0 mt-0.5">
                <button
                  type="button"
                  onClick={() => onMoveSectionUp(sIdx)}
                  disabled={sIdx === 0}
                  className="p-0.5 text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                  title="Subir Seção"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveSectionDown(sIdx)}
                  disabled={sIdx === totalSections - 1}
                  className="p-0.5 text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                  title="Descer Seção"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            )}

            <span className="text-xs font-black text-[#1a3a5c] shrink-0 mt-1">
              {sIdx + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <textarea
                ref={(el) => {
                  if (el && focusedSectionId === secao.id) {
                    el.focus();
                    setFocusedSectionId(null);
                  }
                }}
                rows={1}
                value={secao.titulo}
                onChange={(e) => onSectionTitleChange(secao.id, e.target.value)}
                className={cn(
                  "font-black text-xs sm:text-sm uppercase tracking-wide bg-transparent border-b border-dashed focus:outline-none px-1 py-0.5 w-full transition-colors resize-none leading-snug break-words",
                  showErrors && isTitleEmpty
                    ? "text-red-600 border-red-300 placeholder:text-red-300"
                    : "text-slate-800 border-slate-200 hover:border-blue-400 focus:border-blue-500"
                )}
                placeholder="DIGITE O TÍTULO DA SEÇÃO..."
                title="Toque para editar o título da seção"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            <button
              type="button"
              onClick={onToggleExpandSection}
              className="p-1.5 text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 rounded-xl transition-colors"
              title={isSectionExpanded ? "Recolher Seção" : "Expandir Seção"}
            >
              {isSectionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => onDeleteSection(secao.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Excluir Seção"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[9px] sm:text-[10px] text-slate-400 font-medium">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer",
            isSecaoEmpty ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
          )} onClick={onToggleExpandSection}>
            {secao.clausulas.length} {secao.clausulas.length === 1 ? "Cláusula" : "Cláusulas"}
          </span>
          <span className="text-[9px] text-slate-400 italic">
            {isSectionExpanded ? "Toque no título para renomear" : "Toque na seta para ver cláusulas"}
          </span>
        </div>
      </div>

      {/* Conteúdo da Seção (apenas quando expandida) */}
      {isSectionExpanded && (
        <>
          {/* Lista de Cláusulas dentro da Seção */}
          <div className="space-y-3 pt-1">
            {secao.clausulas.map((clause, cIdx) => (
              <ClauseItemCard
                key={clause.id}
                clause={clause}
                cIdx={cIdx}
                sIdx={sIdx}
                totalSections={totalSections}
                totalClausesInSection={secao.clausulas.length}
                showErrors={showErrors}
                isExpanded={expandedClauseKey === clause.id}
                onToggleExpand={() => setExpandedClauseKey(expandedClauseKey === clause.id ? null : clause.id)}
                clauseRefs={clauseRefs}
                onMoveClauseUp={onMoveClauseUp}
                onMoveClauseDown={onMoveClauseDown}
                onClauseChange={(text) => onClauseChange(clause.id, text)}
                onDeleteClause={() => onDeleteClause(clause.id)}
              />
            ))}
          </div>

          {/* Botão de Adicionar Cláusula na Seção */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onAddClause}
              className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#1a3a5c] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              Adicionar Cláusula nesta Seção
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Componente para a Cláusula com Reordenação por Setas
interface ClauseItemCardProps {
  clause: ClauseItemUI;
  cIdx: number;
  sIdx: number;
  totalSections: number;
  totalClausesInSection: number;
  showErrors: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  clauseRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onMoveClauseUp: (sIdx: number, cIdx: number) => void;
  onMoveClauseDown: (sIdx: number, cIdx: number) => void;
  onClauseChange: (text: string) => void;
  onDeleteClause: () => void;
}

function ClauseItemCard({
  clause,
  cIdx,
  sIdx,
  totalSections,
  totalClausesInSection,
  showErrors,
  isExpanded,
  onToggleExpand,
  clauseRefs,
  onMoveClauseUp,
  onMoveClauseDown,
  onClauseChange,
  onDeleteClause,
}: ClauseItemCardProps) {
  const isBlank = clause.texto.trim() === "";
  const isFirstClauseOverall = sIdx === 0 && cIdx === 0;
  const isLastClauseOverall = sIdx === totalSections - 1 && cIdx === totalClausesInSection - 1;

  return (
    <div
      ref={(el: HTMLDivElement | null) => {
        clauseRefs.current[clause.id] = el;
      }}
      className={cn(
        "rounded-2xl border transition-all overflow-hidden scroll-mt-4",
        isExpanded
          ? "border-[#1a3a5c] bg-white shadow-md ring-4 ring-[#1a3a5c]/5"
          : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
      )}
    >
      <div
        onClick={onToggleExpand}
        className="p-3 cursor-pointer select-none space-y-2"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Setas de Reordenação da Cláusula (Empilhadas - apenas quando recolhida) */}
            {!isExpanded && (
              <div className="flex flex-col items-center justify-center -space-y-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onMoveClauseUp(sIdx, cIdx)}
                  disabled={isFirstClauseOverall}
                  className="p-0.5 text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                  title={cIdx === 0 ? "Mover para a seção anterior" : "Subir Cláusula"}
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveClauseDown(sIdx, cIdx)}
                  disabled={isLastClauseOverall}
                  className="p-0.5 text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                  title={cIdx === totalClausesInSection - 1 ? "Mover para a próxima seção" : "Descer Cláusula"}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            )}

            <span className="px-2.5 py-1 bg-slate-100 text-[#1a3a5c] rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0">
              CLÁUSULA {cIdx + 1}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onToggleExpand}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border",
                isExpanded
                  ? "bg-[#1a3a5c] text-white border-[#1a3a5c] shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-[#1a3a5c]"
              )}
            >
              {isExpanded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <Pencil className="w-3 h-3 text-slate-400" />
                </>
              )}
            </button>
            {isExpanded ? (
              <button
                type="button"
                onClick={() => onClauseChange("")}
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Limpar conteúdo"
              >
                <Eraser className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onDeleteClause()}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir Cláusula"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {!isExpanded && (
          <p className="text-xs text-slate-600 font-normal italic line-clamp-2 leading-relaxed pl-1 flex-1">
            {clause.texto.trim() ? clause.texto : "Clique em Editar para preencher o texto..."}
          </p>
        )}
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0 space-y-2">
          <textarea
            autoFocus={isBlank && isExpanded}
            value={clause.texto}
            onChange={(e) => onClauseChange(e.target.value)}
            placeholder="Digite o texto da cláusula..."
            className={cn(
              "w-full p-4 text-xs sm:text-sm text-slate-800 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/5 leading-relaxed placeholder:text-slate-300 font-medium transition-all min-h-[300px] sm:min-h-[380px] h-[calc(100dvh-320px)] max-h-[500px] resize-y",
              showErrors && isBlank ? "border-red-300 bg-red-50/20" : ""
            )}
          />
        </div>
      )}
    </div>
  );
}
