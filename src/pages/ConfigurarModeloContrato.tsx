import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { SignaturePad, SignaturePadRef } from "@/components/common/SignaturePad";
import { LogoUpload } from "@/components/forms/LogoUpload";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractSection, DEFAULT_SECOES_CONTRATO } from "@/constants/defaults";
import { ROUTES } from "@/constants/routes";
import { usePreviewContrato } from "@/hooks/api/useContratos";
import { useProfile } from "@/hooks/business/useProfile";
import { cn } from "@/lib/utils";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { usuarioApi } from "@/services/api/usuario.api";
import { ContractMultaTipo } from "@/types/enums";
import { toast } from "@/utils/notifications/toast";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Eraser,
  Eye,
  FileText,
  Loader2,
  Maximize2,
  PenTool,
  Pencil,
  Percent,
  Plus,
  RotateCcw,
  Scale,
  Timer,
  Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Usuario } from "@/types/usuario";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type SetupTab = "fees" | "clauses" | "identity";

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

function buildSnapshot(
  secoes: ContractSectionUI[],
  multaAtraso: { valor: number; tipo: ContractMultaTipo },
  jurosAtraso: { valor: number; tipo: ContractMultaTipo },
  multaRescisao: { valor: number; tipo: ContractMultaTipo },
  signature: string | null,
  logo: string | null
): string {
  return JSON.stringify({
    secoes: secoes.map((s) => ({
      titulo: s.titulo.trim(),
      clausulas: s.clausulas.map((c) => c.texto.trim()),
    })),
    multaAtraso,
    jurosAtraso,
    multaRescisao,
    signature: signature || null,
    logo: logo || null,
  });
}

export default function ConfigurarModeloContrato() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const queryClient = useQueryClient();
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { profile, refreshProfile } = useProfile();
  const [isLocallyActive, setIsLocallyActive] = useState(false);
  const [activeTab, setActiveTab] = useState<SetupTab>("clauses");
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
    valor: 0,
    tipo: ContractMultaTipo.FIXO,
  });

  const [secoes, setSecoes] = useState<ContractSectionUI[]>([]);
  const [signatureTemp, setSignatureTemp] = useState<string | null>(null);
  const [logoTemp, setLogoTemp] = useState<string | null>(null);
  const sigPad = useRef<SignaturePadRef>(null);

  const [editingSectionData, setEditingSectionData] = useState<{
    id: string;
    index: number;
    title: string;
  } | null>(null);
  const [tempSectionTitle, setTempSectionTitle] = useState("");

  const [editingClauseData, setEditingClauseData] = useState<{
    sectionId: string;
    sectionTitle: string;
    clauseId: string;
    clauseIndex: number;
    initialText: string;
  } | null>(null);
  const [editingText, setEditingText] = useState("");

  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const initialSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) window.URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (profile && !initializedRef.current) {
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

      const isDefault = !profile.config_contrato?.usar_contratos;
      const initialMulta = profile.config_contrato?.multa_atraso
        ? (isDefault ? { ...profile.config_contrato.multa_atraso, tipo: ContractMultaTipo.FIXO } : profile.config_contrato.multa_atraso)
        : { valor: 10, tipo: ContractMultaTipo.FIXO };
      const initialJuros = profile.config_contrato?.juros_atraso
        ? (isDefault ? { ...profile.config_contrato.juros_atraso, tipo: ContractMultaTipo.PERCENTUAL } : profile.config_contrato.juros_atraso)
        : { valor: 1, tipo: ContractMultaTipo.PERCENTUAL };
      const initialRescisao = profile.config_contrato?.multa_rescisao || { valor: 0, tipo: ContractMultaTipo.FIXO };

      setMultaAtraso(initialMulta);
      setJurosAtraso(initialJuros);
      setMultaRescisao(initialRescisao);

      const initialSig = profile.assinatura_digital_url || null;
      const initialLogo = profile.logo_url || null;

      if (initialSig) setSignatureTemp(initialSig);
      setLogoTemp(initialLogo);

      if (profile.config_contrato?.usar_contratos && initialSig) {
        setIsLocallyActive(true);
      }

      initialSnapshotRef.current = buildSnapshot(
        loadedSecoes,
        initialMulta,
        initialJuros,
        initialRescisao,
        initialSig,
        initialLogo
      );

      initializedRef.current = true;
    }
  }, [profile]);

  const isDirty = useMemo(() => {
    if (!initializedRef.current || !initialSnapshotRef.current) return false;

    const currentSnapshot = buildSnapshot(
      secoes,
      multaAtraso,
      jurosAtraso,
      multaRescisao,
      signatureTemp,
      logoTemp !== null ? logoTemp : (profile?.logo_url || null)
    );

    return currentSnapshot !== initialSnapshotRef.current;
  }, [secoes, multaAtraso, jurosAtraso, multaRescisao, signatureTemp, logoTemp, profile]);

  const isContractActive = isLocallyActive || Boolean(
    profile?.config_contrato?.usar_contratos && profile?.assinatura_digital_url
  );

  const showSaveButton = !isContractActive || isDirty;
  const saveButtonText = !isContractActive ? "Salvar e Ativar Modelo" : "Salvar Alterações";

  const captureSignature = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      const sig = sigPad.current.toDataURL("image/png");
      setSignatureTemp(sig);
      return sig;
    }
    return signatureTemp;
  };

  const handleOpenSectionTitleEditor = (sectionId: string, index: number, currentTitle: string) => {
    setEditingSectionData({ id: sectionId, index, title: currentTitle });
    setTempSectionTitle(currentTitle);
  };

  const handleSaveSectionTitle = () => {
    if (!editingSectionData) return;
    const trimmed = tempSectionTitle.trim();
    if (!trimmed) return;
    setSecoes((prev) =>
      prev.map((s) => (s.id === editingSectionData.id ? { ...s, titulo: trimmed } : s))
    );
    safeCloseDialog(() => setEditingSectionData(null));
  };

  const handleOpenClauseEditor = (sectionId: string, sectionTitle: string, clauseId: string, clauseIndex: number, text: string) => {
    setEditingClauseData({
      sectionId,
      sectionTitle,
      clauseId,
      clauseIndex,
      initialText: text,
    });
    setEditingText(text);
  };

  const handleSaveClauseEditor = () => {
    if (!editingClauseData) return;
    setSecoes((prev) =>
      prev.map((sec) => {
        if (sec.id === editingClauseData.sectionId) {
          const updated = sec.clausulas.map((c) =>
            c.id === editingClauseData.clauseId ? { ...c, texto: editingText } : c
          );
          return { ...sec, clausulas: updated };
        }
        return sec;
      })
    );
    safeCloseDialog(() => setEditingClauseData(null));
  };

  const handleAddClauseToSection = (sectionId: string, sectionTitle: string) => {
    const newClauseId = `clause-${sectionId}-${Date.now()}`;
    const targetSec = secoes.find((s) => s.id === sectionId);
    const newIndex = targetSec ? targetSec.clausulas.length : 0;

    setSecoes((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            clausulas: [...sec.clausulas, { id: newClauseId, texto: "" }],
          };
        }
        return sec;
      })
    );

    handleOpenClauseEditor(sectionId, sectionTitle, newClauseId, newIndex, "");
  };

  const handleAddSection = () => {
    const newSecaoId = `secao-${Date.now()}`;
    const newClauseId = `clause-${newSecaoId}-0`;
    const newIndex = secoes.length;
    const newSecao: ContractSectionUI = {
      id: newSecaoId,
      titulo: "",
      clausulas: [{ id: newClauseId, texto: "" }],
    };
    setSecoes((prev) => [...prev, newSecao]);
    handleOpenSectionTitleEditor(newSecaoId, newIndex, "");
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
      if (editingClauseData?.clauseId === clauseId) {
        setEditingClauseData(null);
      }
    };

    if (!text.trim()) {
      executeDelete();
      return;
    }

    openConfirmationDialog({
      title: "Excluir Cláusula?",
      description: "Tem certeza que deseja excluir esta cláusula do modelo?",
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: () => {
        executeDelete();
        closeConfirmationDialog();
      },
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    const targetSecao = secoes.find((s) => s.id === sectionId);
    const hasContent = targetSecao?.clausulas.some((c) => c.texto.trim() !== "") || Boolean(targetSecao?.titulo.trim());

    const executeDelete = () => {
      setSecoes((prev) => prev.filter((s) => s.id !== sectionId));
    };

    if (!hasContent) {
      executeDelete();
      return;
    }

    openConfirmationDialog({
      title: "Excluir Seção?",
      description: `Tem certeza que deseja excluir a seção "${targetSecao?.titulo || 'Nova Seção'}" e suas cláusulas?`,
      confirmText: "Excluir Seção",
      variant: "destructive",
      onConfirm: () => {
        executeDelete();
        closeConfirmationDialog();
      },
    });
  };

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
        currentSec.clausulas.splice(cIdx, 1);
        currentSec.clausulas.splice(cIdx - 1, 0, clauseToMove);
      } else {
        const prevSec = next[sIdx - 1];
        currentSec.clausulas.splice(cIdx, 1);
        prevSec.clausulas.push(clauseToMove);
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
        sec.clausulas.splice(cIdx, 1);
        sec.clausulas.splice(cIdx + 1, 0, clauseToMove);
      } else {
        const nextSec = next[sIdx + 1];
        sec.clausulas.splice(cIdx, 1);
        nextSec.clausulas.unshift(clauseToMove);
      }
      return next;
    });
  };

  const cleanSecoesDTO: ContractSection[] = useMemo(() => {
    return secoes
      .filter((s) => s.titulo.trim() !== "")
      .map((s) => ({
        id: s.id,
        titulo: s.titulo.trim(),
        clausulas: s.clausulas.map((c) => c.texto.trim()).filter((t) => t !== ""),
      }))
      .filter((s) => s.clausulas.length > 0);
  }, [secoes]);

  const flatClausulas: string[] = useMemo(() => {
    return cleanSecoesDTO.flatMap((s) => s.clausulas);
  }, [cleanSecoesDTO]);

  const totalClausulas = useMemo(() => {
    return secoes.reduce((acc, s) => acc + s.clausulas.length, 0);
  }, [secoes]);

  const handleOpenPreviewPdf = async () => {
    const finalSig = captureSignature();
    try {
      const result = await previewMutation.mutateAsync({
        secoes: cleanSecoesDTO,
        clausulas: flatClausulas,
        multaAtraso,
        jurosAtraso,
        multaRescisao,
        assinaturaCondutorUrl: finalSig || profile?.assinatura_digital_url,
        logoCondutorUrl: logoTemp !== null ? logoTemp : profile?.logo_url,
      });
      if (pdfUrlRef.current) window.URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = result.url;
      setPdfUrl(result.url);
      setIsPreviewPdfOpen(true);
    } catch {
      toast.error("Não foi possível gerar a prévia do modelo.");
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    const hasEmptySections = secoes.some(
      (s) => s.titulo.trim() === "" || s.clausulas.length === 0 || s.clausulas.some((c) => c.texto.trim() === "")
    );

    if (hasEmptySections) {
      setShowErrors(true);
      setActiveTab("clauses");
      toast.error("Preencha todas as seções e cláusulas antes de salvar.");
      return;
    }

    const finalSig = captureSignature();
    if (!finalSig && !profile.assinatura_digital_url) {
      setActiveTab("identity");
      toast.error("Faça a sua assinatura digital para ativar seu modelo de contrato.");
      setTimeout(() => {
        const el = document.getElementById("assinatura-digital-card");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 120);
      return;
    }

    setIsSubmitting(true);
    const wasActive = isContractActive;
    try {
      const resolvedLogo = logoTemp !== null ? logoTemp : (profile.logo_url || null);
      const resolvedSig = finalSig || profile.assinatura_digital_url || null;

      await usuarioApi.atualizarUsuario(profile.id, {
        assinatura_digital_url: resolvedSig || undefined,
        logo_url: resolvedLogo,
        config_contrato: {
          usar_contratos: true,
          multa_atraso: multaAtraso,
          juros_atraso: jurosAtraso,
          multa_rescisao: multaRescisao,
          secoes: cleanSecoesDTO,
          clausulas: flatClausulas,
        },
      });

      setIsLocallyActive(true);
      if (resolvedSig) setSignatureTemp(resolvedSig);
      if (resolvedLogo) setLogoTemp(resolvedLogo);

      initialSnapshotRef.current = buildSnapshot(
        secoes,
        multaAtraso,
        jurosAtraso,
        multaRescisao,
        resolvedSig,
        resolvedLogo
      );

      queryClient.setQueryData<Usuario>(["profile"], (old) => {
        if (!old) return old;
        return {
          ...old,
          assinatura_digital_url: resolvedSig || old.assinatura_digital_url,
          logo_url: resolvedLogo,
          config_contrato: {
            ...old.config_contrato,
            usar_contratos: true,
            multa_atraso: multaAtraso,
            juros_atraso: jurosAtraso,
            multa_rescisao: multaRescisao,
            secoes: cleanSecoesDTO,
            clausulas: flatClausulas,
          },
        };
      });

      refreshProfile();

      if (!wasActive) {
        toast.success("Modelo de contrato ativado com sucesso! Agora você já pode emitir contratos.");
      } else {
        toast.success("Modelo de contrato salvo com sucesso!");
      }

      if (returnTo) {
        navigate(returnTo);
      }
    } catch {
      toast.error("Erro ao salvar modelo de contrato.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-32 pt-1 sm:pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate(returnTo || ROUTES.PRIVATE.MOTORISTA.CONTRACTS)}
            className="h-10 w-10 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shrink-0 shadow-xs cursor-pointer"
            title={returnTo ? "Voltar" : "Voltar para Contratos"}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight">
              Modelo de Contrato
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] mt-0.5 font-normal">
              Diretrizes de multas, cláusulas jurídicas e assinatura da sua operação.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleOpenPreviewPdf}
          disabled={previewMutation.isPending}
          className="w-full sm:w-auto h-10 px-4 rounded-[18px] border-[#e5e5e5] hover:border-[#737373]/50 bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] text-xs font-medium gap-2 shadow-2xs cursor-pointer shrink-0"
        >
          {previewMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#737373]" />
          ) : (
            <Eye className="w-4 h-4 text-[#0a0a0a]" />
          )}
          <span>Visualizar Minuta em PDF</span>
        </Button>
      </div>

      <div className="bg-[#f5f5f5] p-1 rounded-[20px] sm:rounded-[22px] border border-[#e5e5e5] w-full grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("clauses")}
          className={cn(
            "flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-4 rounded-[16px] sm:rounded-[18px] text-xs sm:text-sm font-medium transition-all cursor-pointer text-center",
            activeTab === "clauses"
              ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
              : "text-[#737373] hover:text-[#0a0a0a]"
          )}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">Cláusulas & Termos</span>
          <span className="sm:hidden text-[11px]">Cláusulas</span>
          <span className={cn(
            "text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full border hidden min-[360px]:inline-flex",
            activeTab === "clauses"
              ? "bg-[#f5f5f5] text-[#0a0a0a] border-[#e5e5e5]"
              : "bg-white text-[#737373] border-[#e5e5e5]"
          )}>
            {secoes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fees")}
          className={cn(
            "flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-4 rounded-[16px] sm:rounded-[18px] text-xs sm:text-sm font-medium transition-all cursor-pointer text-center",
            activeTab === "fees"
              ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
              : "text-[#737373] hover:text-[#0a0a0a]"
          )}
        >
          <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">Multas & Juros</span>
          <span className="sm:hidden text-[11px]">Multas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("identity")}
          className={cn(
            "flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-4 rounded-[16px] sm:rounded-[18px] text-xs sm:text-sm font-medium transition-all cursor-pointer text-center",
            activeTab === "identity"
              ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
              : "text-[#737373] hover:text-[#0a0a0a]"
          )}
        >
          <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">Identidade & Assinatura</span>
          <span className="sm:hidden text-[11px]">Assinatura</span>
        </button>
      </div>

      {activeTab === "clauses" && (
        <div className="space-y-4">
          <div className="space-y-4">
            {secoes.map((secao, sIdx) => {
              const isTitleEmpty = secao.titulo.trim() === "";
              return (
                <div
                  key={secao.id}
                  className={cn(
                    "p-4 sm:p-5 bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs space-y-4 transition-all",
                    showErrors && isTitleEmpty ? "border-[#e7000b] ring-1 ring-[#e7000b]" : ""
                  )}
                >
                  <div className="flex flex-col gap-2 pb-3 border-b border-[#e5e5e5]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                          Seção {sIdx + 1}
                        </span>
                        {secoes.length > 1 && (
                          <div className="flex items-center bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] p-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveSectionUp(sIdx)}
                              disabled={sIdx === 0}
                              className="p-1 text-[#737373] hover:text-[#0a0a0a] rounded disabled:opacity-20 transition-colors cursor-pointer"
                              title="Subir Seção"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSectionDown(sIdx)}
                              disabled={sIdx === secoes.length - 1}
                              className="p-1 text-[#737373] hover:text-[#0a0a0a] rounded disabled:opacity-20 transition-colors cursor-pointer"
                              title="Descer Seção"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSection(secao.id)}
                        className="p-1.5 text-[#737373] hover:text-[#e7000b] hover:bg-red-50 rounded-[10px] transition-colors cursor-pointer shrink-0"
                        title="Excluir Seção"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pt-0.5">
                      {secao.titulo.trim() ? (
                        <div
                          onClick={() => handleOpenSectionTitleEditor(secao.id, sIdx, secao.titulo)}
                          className="flex items-center justify-between p-2.5 sm:p-3 bg-[#fafafa] hover:bg-[#f0f0f0] rounded-[16px] border border-[#e5e5e5] cursor-pointer group/title transition-all"
                          title="Clique para editar o título da seção"
                        >
                          <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] uppercase tracking-wide leading-snug break-words flex-1 pr-2">
                            {secao.titulo}
                          </span>
                          <Pencil className="w-3.5 h-3.5 text-[#737373] group-hover/title:text-[#0a0a0a] shrink-0" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenSectionTitleEditor(secao.id, sIdx, secao.titulo)}
                          className="w-full py-2.5 px-3 bg-[#fafafa] hover:bg-white border border-dashed border-[#e5e5e5] hover:border-[#0a0a0a] rounded-[16px] flex items-center justify-center gap-1.5 text-xs text-[#737373] hover:text-[#0a0a0a] font-medium transition-all cursor-pointer"
                          title="Definir título da seção"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Definir título da seção</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {secao.clausulas.map((clause, cIdx) => {
                      const isBlank = clause.texto.trim() === "";
                      return (
                        <div
                          key={clause.id}
                          onClick={() => handleOpenClauseEditor(secao.id, secao.titulo, clause.id, cIdx, clause.texto)}
                          className={cn(
                            "p-3.5 sm:p-4 bg-[#fafafa] hover:bg-[#f0f0f0]/80 rounded-[18px] border border-[#e5e5e5] hover:border-[#737373]/50 transition-all cursor-pointer group flex flex-col gap-2 relative",
                            showErrors && isBlank ? "border-[#e7000b] ring-1 ring-[#e7000b]" : ""
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#0a0a0a] uppercase tracking-wider">
                              Cláusula {cIdx + 1}
                            </span>

                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center bg-white border border-[#e5e5e5] rounded-[10px] p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveClauseUp(sIdx, cIdx)}
                                  disabled={sIdx === 0 && cIdx === 0}
                                  className="p-1 text-[#737373] hover:text-[#0a0a0a] rounded disabled:opacity-20 transition-colors cursor-pointer"
                                  title="Subir Cláusula"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveClauseDown(sIdx, cIdx)}
                                  disabled={sIdx === secoes.length - 1 && cIdx === secao.clausulas.length - 1}
                                  className="p-1 text-[#737373] hover:text-[#0a0a0a] rounded disabled:opacity-20 transition-colors cursor-pointer"
                                  title="Descer Cláusula"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteClause(secao.id, clause.id)}
                                className="p-1 text-[#737373] hover:text-[#e7000b] hover:bg-red-50 rounded-[8px] transition-colors cursor-pointer"
                                title="Excluir Cláusula"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className={cn(
                            "text-xs sm:text-sm leading-relaxed line-clamp-3",
                            isBlank ? "text-[#737373] italic" : "text-[#0a0a0a]"
                          )}>
                            {isBlank ? "Nenhum texto inserido. Clique aqui para abrir o editor e redigir a cláusula..." : clause.texto}
                          </p>

                          <div className="flex items-center justify-end text-[11px] font-medium text-[#737373] group-hover:text-[#0a0a0a] gap-1 pt-1 transition-colors">
                            <Maximize2 className="w-3 h-3" />
                            <span>Abrir editor amplo</span>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleAddClauseToSection(secao.id, secao.titulo)}
                      className="w-full py-3 bg-white border border-dashed border-[#e5e5e5] hover:border-[#0a0a0a] hover:bg-[#fafafa] text-[#0a0a0a] font-medium text-xs sm:text-sm rounded-[16px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-4 h-4 text-[#0a0a0a]" />
                      <span>Adicionar Cláusula nesta Seção</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddSection}
            className="w-full py-3.5 sm:py-4 bg-white border border-dashed border-[#e5e5e5] hover:border-[#0a0a0a] hover:bg-[#fafafa] text-[#0a0a0a] font-medium text-xs sm:text-sm rounded-[20px] flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#0a0a0a]" />
            <span>Adicionar Nova Seção</span>
          </button>
        </div>
      )}

      {activeTab === "fees" && (
        <div className="space-y-4">
          <Banner
            variant="info"
            description="Os parâmetros abaixo serão aplicados automaticamente nas parcelas e no cálculo de cobrança de contratos emitidos."
            className="rounded-[20px]"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Multa por Atraso",
                desc: "Aplicada em caso de atraso na mensalidade.",
                state: multaAtraso,
                setState: setMultaAtraso,
                icon: Timer,
                simBaseValue: 200,
                simResult:
                  multaAtraso.tipo === ContractMultaTipo.PERCENTUAL
                    ? (200 * (1 + multaAtraso.valor / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : (200 + multaAtraso.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
              },
              {
                title: "Juros por Atraso",
                desc: "Juros cobrados pelo período em aberto.",
                state: jurosAtraso,
                setState: setJurosAtraso,
                icon: Percent,
                simBaseValue: 200,
                simResult:
                  jurosAtraso.tipo === ContractMultaTipo.PERCENTUAL
                    ? (200 * (jurosAtraso.valor / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : jurosAtraso.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
              },
              {
                title: "Multa Rescisória",
                desc: "Encerramento imotivado antes do prazo.",
                state: multaRescisao,
                setState: setMultaRescisao,
                icon: Scale,
                simBaseValue: 2400,
                simResult:
                  multaRescisao.tipo === ContractMultaTipo.PERCENTUAL
                    ? (2400 * (multaRescisao.valor / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : multaRescisao.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
              },
            ].map(({ title, desc, state, setState, icon: Icon, simBaseValue, simResult }) => (
              <div
                key={title}
                className="p-5 bg-white rounded-[22px] border border-[#e5e5e5] shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#0a0a0a]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-[#0a0a0a] leading-tight">
                        {title}
                      </h4>
                      <p className="text-xs text-[#737373] mt-0.5 leading-snug">{desc}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex bg-[#f5f5f5] p-1 rounded-[14px] border border-[#e5e5e5] w-full">
                      <button
                        type="button"
                        onClick={() => setState({ ...state, tipo: ContractMultaTipo.FIXO })}
                        className={cn(
                          "flex-1 py-1.5 rounded-[10px] text-xs transition-all cursor-pointer",
                          state.tipo === ContractMultaTipo.FIXO
                            ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
                            : "text-[#737373] hover:text-[#0a0a0a]"
                        )}
                      >
                        R$ Fixo
                      </button>
                      <button
                        type="button"
                        onClick={() => setState({ ...state, tipo: ContractMultaTipo.PERCENTUAL })}
                        className={cn(
                          "flex-1 py-1.5 rounded-[10px] text-xs transition-all cursor-pointer",
                          state.tipo === ContractMultaTipo.PERCENTUAL
                            ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
                            : "text-[#737373] hover:text-[#0a0a0a]"
                        )}
                      >
                        % Taxa
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        type="text"
                        inputMode={state.tipo === ContractMultaTipo.PERCENTUAL ? "decimal" : "numeric"}
                        value={
                          state.tipo === ContractMultaTipo.PERCENTUAL
                            ? (state.valor === 0 ? "" : state.valor.toString().replace('.', ','))
                            : (state.valor === 0 ? "" : moneyMask(state.valor))
                        }
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
                          "w-full h-11 rounded-[16px] bg-[#f5f5f5] hover:bg-[#ebebeb]/60 focus:bg-white border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] font-semibold text-sm text-[#0a0a0a] pl-3.5 transition-all",
                          state.tipo === ContractMultaTipo.PERCENTUAL ? "pr-8" : "pr-3.5"
                        )}
                        placeholder={state.tipo === ContractMultaTipo.PERCENTUAL ? "0" : "R$ 0,00"}
                      />
                      {state.tipo === ContractMultaTipo.PERCENTUAL && (
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#737373] pointer-events-none">
                          %
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#737373] space-y-1">
                  <div className="flex justify-between items-center text-[10px] uppercase font-medium">
                    <span>Exemplo {simBaseValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}:</span>
                    <span className="font-semibold text-[#0a0a0a]">{simResult}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "identity" && (
        <div className="space-y-5">
          {profile && (
            <div className="p-5 sm:p-6 bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs space-y-3">
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a] uppercase tracking-wider">
                  Logotipo
                </h4>
                <p className="text-xs text-[#737373] mt-0.5 font-normal">
                  Exibido com destaque no cabeçalho timbrado dos contratos e minutas emitidos para os responsáveis.
                </p>
              </div>
              <LogoUpload
                userId={profile.id}
                currentLogoUrl={logoTemp !== null ? logoTemp : (profile.logo_url || null)}
                variant="contract"
                onLogoChange={async (newLogoUrl) => {
                  setLogoTemp(newLogoUrl);
                  await usuarioApi.atualizarUsuario(profile.id, { logo_url: newLogoUrl });
                  await refreshProfile();
                }}
              />
            </div>
          )}

          <div id="assinatura-digital-card" className="p-5 sm:p-6 bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs space-y-4 scroll-mt-24">
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#0a0a0a] uppercase tracking-wider">
                Assinatura Digital <span className="text-[#e7000b]">*</span>
              </h4>
              <p className="text-xs text-[#737373] mt-0.5 font-normal">
                Desenhe no quadro abaixo com o dedo no celular ou mouse no computador.
              </p>
            </div>

            <SignaturePad
              ref={sigPad}
              initialValue={signatureTemp}
              onChange={(dataUrl) => {
                setSignatureTemp(dataUrl || "");
              }}
            />
          </div>
        </div>
      )}

      {showSaveButton && (
        <>
          <div className="hidden md:block fixed bottom-0 left-72 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e5e5e5] py-3 sm:py-4 pb-[calc(0.75rem+var(--safe-area-bottom))] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="h-11 px-6 rounded-[18px] bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground text-sm font-medium gap-2 shadow-xs cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{saveButtonText}</span>
              </Button>
            </div>
          </div>

          <div className="md:hidden fixed bottom-[calc(4.5rem+var(--safe-area-bottom))] inset-x-0 px-4 z-40 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full max-w-md h-12 rounded-[18px] bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground text-sm font-semibold gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.3)] pointer-events-auto cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
              ) : (
                <Check className="w-4 h-4 text-primary-foreground" />
              )}
              <span>{saveButtonText}</span>
            </Button>
          </div>
        </>
      )}

      {editingClauseData && (
        <BaseDialog
          open={Boolean(editingClauseData)}
          onOpenChange={(open) => {
            if (!open) safeCloseDialog(() => setEditingClauseData(null));
          }}
          maxWidth="2xl"
          description={editingClauseData.sectionTitle ? `Seção: ${editingClauseData.sectionTitle}` : "Edição do texto contratual"}
        >
          <BaseDialog.Header
            title={`Editar Cláusula ${editingClauseData.clauseIndex + 1}`}
            subtitle={editingClauseData.sectionTitle ? `Seção: ${editingClauseData.sectionTitle}` : "Edição do texto contratual"}
            showSteps={false}
            hideCloseButton={false}
            onClose={() => safeCloseDialog(() => setEditingClauseData(null))}
          />

          <BaseDialog.Body className="p-4 sm:p-6 bg-white space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-[#0a0a0a]">
                  Texto Completo da Cláusula <span className="text-[#e7000b]">*</span>
                </Label>
                <span className="text-[11px] text-[#737373]">
                  {editingText.length} caracteres
                </span>
              </div>

              <textarea
                autoFocus={!editingClauseData.initialText.trim()}
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                placeholder="Digite o texto da cláusula..."
                className="w-full min-h-[300px] sm:min-h-[380px] p-4 text-xs sm:text-sm text-[#0a0a0a] bg-[#f5f5f5] focus:bg-white border border-[#e5e5e5] rounded-[16px] focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] leading-relaxed placeholder:text-[#737373] transition-all resize-y outline-none"
              />
            </div>
          </BaseDialog.Body>

          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(() => setEditingClauseData(null))}
            />
            <BaseDialog.Action
              label="Concluir Edição"
              variant="primary"
              disabled={!editingText.trim()}
              onClick={handleSaveClauseEditor}
            />
          </BaseDialog.Footer>
        </BaseDialog>
      )}

      {editingSectionData && (
        <BaseDialog
          open={Boolean(editingSectionData)}
          onOpenChange={(open) => {
            if (!open) safeCloseDialog(() => setEditingSectionData(null));
          }}
          maxWidth="md"
          description="Edição do título da seção contratual"
        >
          <BaseDialog.Header
            title="Editar Título da Seção"
            subtitle={`Seção ${editingSectionData.index + 1}`}
            showSteps={false}
            hideCloseButton={false}
            onClose={() => safeCloseDialog(() => setEditingSectionData(null))}
          />

          <BaseDialog.Body className="p-4 sm:p-6 bg-white space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-[#0a0a0a]">
                  Título da Seção <span className="text-[#e7000b]">*</span>
                </Label>
                <span className="text-[11px] text-[#737373]">
                  {tempSectionTitle.length} caracteres
                </span>
              </div>

              <Input
                autoFocus={!editingSectionData.title.trim()}
                value={tempSectionTitle}
                onChange={(e) => setTempSectionTitle(e.target.value.toUpperCase())}
                placeholder="Ex: DA PRESTAÇÃO DO SERVIÇO"
                className="h-11 rounded-[16px] bg-[#f5f5f5] hover:bg-[#ebebeb]/60 focus:bg-white border-[#e5e5e5] focus:border-[#0a0a0a] font-semibold text-xs sm:text-sm text-[#0a0a0a] uppercase tracking-wide transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tempSectionTitle.trim()) {
                    e.preventDefault();
                    handleSaveSectionTitle();
                  }
                }}
              />

              <p className="text-[11px] text-[#737373] leading-relaxed">
                Este título será exibido como divisor para o grupo de cláusulas no documento timbrado em PDF.
              </p>
            </div>
          </BaseDialog.Body>

          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(() => setEditingSectionData(null))}
            />
            <BaseDialog.Action
              label="Salvar Título"
              variant="primary"
              disabled={!tempSectionTitle.trim()}
              onClick={handleSaveSectionTitle}
            />
          </BaseDialog.Footer>
        </BaseDialog>
      )}

      <PdfPreviewDialog
        isOpen={isPreviewPdfOpen}
        isLoading={previewMutation.isPending}
        onClose={() => safeCloseDialog(() => setIsPreviewPdfOpen(false))}
        pdfUrl={pdfUrl}
        title="Prévia do Modelo de Contrato"
        fileName="modelo_contrato.pdf"
        showDownload={true}
      />
    </div>
  );
}
