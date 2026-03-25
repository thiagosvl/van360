import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface ContractSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (usarContratos?: boolean) => void;
}

enum SetupStep {
  WELCOME = 0,
  FEES = 1,
  CLAUSES = 2,
  SIGNATURE = 3,
  PREVIEW = 4,
}

export default function ContractSetupDialog({
  isOpen,
  onClose,
  onSuccess,
}: ContractSetupDialogProps) {
  const { profile, refreshProfile } = useProfile();
  const [step, setStep] = useState<SetupStep>(SetupStep.WELCOME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const previewMutation = usePreviewContrato();

  // State for configuration
  const [usarContratos, setUsarContratos] = useState(true);
  const [multaAtraso, setMultaAtraso] = useState<{
    valor: number;
    tipo: "percentual" | "fixo";
  }>({ valor: 10, tipo: "percentual" });
  const [multaRescisao, setMultaRescisao] = useState<{
    valor: number;
    tipo: "percentual" | "fixo";
  }>({ valor: 15, tipo: "percentual" });
  const [clausulas, setClausulas] = useState<string[]>([]);
  const [signatureTemp, setSignatureTemp] = useState<string | null>(null);
  const sigPad = useRef<SignatureCanvas>(null);
  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Memory management for PDF Blob URL
  const pdfUrlRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) {
        window.URL.revokeObjectURL(pdfUrlRef.current);
      }
    };
  }, []);

  // Initialize from profile or default
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      return;
    }

    if (isOpen && profile && !initializedRef.current) {
      if (profile.config_contrato?.clausulas) {
        setClausulas(profile.config_contrato.clausulas);
      } else {
        setClausulas(DEFAULT_CLAUSULAS_CONTRATO);
      }

      if (profile.config_contrato?.multa_atraso)
        setMultaAtraso(profile.config_contrato.multa_atraso);
      if (profile.config_contrato?.multa_rescisao)
        setMultaRescisao(profile.config_contrato.multa_rescisao);

      // Load saved signature if available and no temp signature set
      if (profile.assinatura_digital_url && !signatureTemp) {
        setSignatureTemp(profile.assinatura_digital_url);
      }

      const usar = profile.config_contrato?.usar_contratos;
      setUsarContratos(usar ?? true);
      setStep(SetupStep.WELCOME);
      
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
      const hasSaved = !!profile?.assinatura_digital_url;
      const hasTemp = !!signatureTemp;

      if (!hasDrawing && !hasSaved && !hasTemp) {
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
    if (step === SetupStep.SIGNATURE) {
      captureSignature();
    }
    setStep((s) => s - 1);
  };

  const handleFinalSubmit = async (active: boolean) => {
    if (!profile?.id) return;
    setIsSubmitting(true);
    try {
      let signatureUrl = signatureTemp || profile.assinatura_digital_url;

      if (
        active &&
        (step === SetupStep.SIGNATURE || step === SetupStep.PREVIEW)
      ) {
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">
          Automação de Contratos
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed px-4 italic">
          Gere PDFs automáticos com suas cláusulas e multas, e colete assinaturas digitais via WhatsApp.
        </p>
      </div>

      <div className="grid gap-4">
        <button
          type="button"
          onClick={() => setUsarContratos(true)}
          className={`group flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left ${
            usarContratos
              ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/10"
              : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
            usarContratos ? "bg-blue-600" : "bg-gray-100"
          }`}>
            <FileText className={`w-7 h-7 ${usarContratos ? "text-white" : "text-gray-400"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-base ${usarContratos ? "text-blue-900" : "text-gray-800"}`}>
              Ativar Contratos
            </h4>
            <p className="text-xs text-gray-500 mt-1 leading-normal italic">
              PDF automático para cada novo passageiro, assinado pelo celular.
            </p>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            usarContratos ? "border-blue-600 bg-blue-600" : "border-gray-300"
          }`}>
            {usarContratos && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setUsarContratos(false)}
          className={`group flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left ${
            !usarContratos
              ? "border-gray-600 bg-gray-50 ring-4 ring-gray-200"
              : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
            !usarContratos ? "bg-gray-600" : "bg-gray-100"
          }`}>
            <X className={`w-7 h-7 ${!usarContratos ? "text-white" : "text-gray-400"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-base ${!usarContratos ? "text-gray-900" : "text-gray-700"}`}>
              Manual
            </h4>
            <p className="text-xs text-gray-500 mt-1 leading-normal italic">
              Você prefere gerenciar os contratos de forma externa e manual.
            </p>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            !usarContratos ? "border-gray-600 bg-gray-600" : "border-gray-300"
          }`}>
            {!usarContratos && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
          </div>
        </button>
      </div>

      <AnimatePresence>
        {!usarContratos && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-start"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed italic">
              A qualquer momento você poderá ativar os contratos automáticos na tela de Passageiros ou no seu Perfil.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderFees = () => (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Penalidades e Multas</h3>
        </div>
        <p className="text-xs text-gray-500 ml-7 italic">
          Defina as penalidades padrão que constarão nas cláusulas dos seus contratos.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
          <div>
            <Label className="text-gray-900 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Multa por Atraso
            </Label>
            <p className="text-[11px] text-gray-500 mt-0.5 italic pl-3.5">
              Aplicada sobre o valor da mensalidade em caso de atraso no pagamento.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              value={multaAtraso.valor}
              onChange={(e) =>
                setMultaAtraso({ ...multaAtraso, valor: Number(e.target.value) })
              }
              className="flex-1 h-12 rounded-xl bg-white border-gray-200 focus:ring-4 focus:ring-blue-500/10 text-center font-bold text-lg"
            />
            <Select
              value={multaAtraso.tipo}
              onValueChange={(v: "percentual" | "fixo") =>
                setMultaAtraso({ ...multaAtraso, tipo: v })
              }
            >
              <SelectTrigger className="w-36 h-12 rounded-xl bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentual">Porcentagem (%)</SelectItem>
                <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-[11px] bg-blue-100/50 text-blue-700 px-4 py-2.5 rounded-2xl flex justify-between items-center border border-blue-200/50">
            <span className="font-medium italic">Simulação: R$ 200,00 + Multa =</span>
            <strong className="text-sm">
              {multaAtraso.tipo === "percentual"
                ? (200 * (1 + multaAtraso.valor / 100)).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : (200 + multaAtraso.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
            </strong>
          </div>
        </div>

        <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
          <div>
            <Label className="text-gray-900 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Multa por Rescisão
            </Label>
            <p className="text-[11px] text-gray-500 mt-0.5 italic pl-3.5">
              Cobrada se o contrato for encerrado antes do prazo estipulado.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              value={multaRescisao.valor}
              onChange={(e) =>
                setMultaRescisao({ ...multaRescisao, valor: Number(e.target.value) })
              }
              className="flex-1 h-12 rounded-xl bg-white border-gray-200 focus:ring-4 focus:ring-blue-500/10 text-center font-bold text-lg"
            />
            <Select
              value={multaRescisao.tipo}
              onValueChange={(v: "percentual" | "fixo") =>
                setMultaRescisao({ ...multaRescisao, tipo: v })
              }
            >
              <SelectTrigger className="w-36 h-12 rounded-xl bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentual">Porcentagem (%)</SelectItem>
                <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-[11px] bg-red-50 text-red-700 px-4 py-2.5 rounded-2xl flex justify-between items-center border border-red-100">
            <span className="font-medium italic">Se o plano anual for R$ 2,4k → </span>
            <strong className="text-sm">
              {multaRescisao.tipo === "percentual"
                ? (2400 * (multaRescisao.valor / 100)).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : multaRescisao.valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClauses = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900">
          <PenTool className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold">Cláusulas e Termos</h3>
        </div>
        <div className="px-3 py-1 bg-blue-100 rounded-full text-[10px] font-black text-blue-700 uppercase tracking-wider">
           {clausulas.length} {clausulas.length === 1 ? "Cláusula" : "Cláusulas"}
        </div>
      </div>

      <div className="space-y-4">
        {clausulas.map((clausula, idx) => (
          <motion.div
            key={idx}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-3xl border transition-all overflow-hidden ${
              showErrors && clausula.trim() === ""
                ? "border-red-300 bg-red-50/50 ring-4 ring-red-500/5"
                : "border-gray-100 bg-white shadow-sm hover:border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase">
                # {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => setClausulas(clausulas.filter((_, i) => i !== idx))}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Remover cláusula"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              className={`w-full px-5 pb-5 pt-1 text-sm bg-transparent border-0 focus:outline-none resize-none leading-relaxed placeholder:text-gray-300 italic ${
                showErrors && clausula.trim() === "" ? "text-red-800 placeholder:text-red-300" : "text-gray-600"
              }`}
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
              <div className="px-5 pb-3">
                 <p className="text-[10px] text-red-500 font-bold italic">Campo obrigatório (ou remova a cláusula)</p>
              </div>
            )}
          </motion.div>
        ))}

        <Button
          variant="outline"
          className="w-full h-14 border-dashed border-2 border-blue-200 text-blue-600 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300 rounded-2xl group transition-all"
          onClick={() => setClausulas([...clausulas, ""])}
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" /> 
          <span className="font-bold">Adicionar Cláusula</span>
        </Button>
      </div>
    </div>
  );

  const renderSignature = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-4">
        <h3 className="font-bold text-gray-900 text-lg">Assinatura do Condutor</h3>
        <p className="text-sm text-gray-500 italic px-6">
          Sua assinatura aparecerá no final de todos os contratos em PDF.
        </p>
      </div>

      <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.2rem] blur opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative border-4 border-white rounded-[2rem] bg-gray-50 overflow-hidden shadow-inner touch-none">
            <SignatureCanvas
              ref={(ref) => {
                // @ts-ignore
                sigPad.current = ref;
                if (ref && signatureTemp && ref.isEmpty()) {
                    ref.fromDataURL(signatureTemp);
                }
              }}
              penColor="rgb(30, 64, 175)"
              minWidth={1.5}
              maxWidth={3.5}
              canvasProps={{
                className: "w-full h-52 cursor-crosshair",
              }}
              onEnd={() => {
                 if (sigPad.current && !sigPad.current.isEmpty()) {
                     setSignatureTemp(sigPad.current.toDataURL("image/png"));
                 }
              }}
            />
            <div className="absolute top-4 right-4 animate-pulse">
                <div className="bg-blue-600/10 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-blue-100 shadow-sm">
                    <PenTool className="w-3 h-3 text-blue-600" />
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-tighter">Área de Assinatura</span>
                </div>
            </div>
          </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => {
            sigPad.current?.clear();
            setSignatureTemp(null);
          }}
          className="text-[11px] font-black text-gray-400 hover:text-red-500 flex items-center gap-1.5 uppercase tracking-widest transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Limpar e refazer
        </button>
        
        {signatureTemp && (
          <div className="px-6 py-2 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500" />
             <p className="text-[11px] font-bold text-green-700 italic">✓ Assinatura salva e validada</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-black text-gray-900">Resumo da Configuração</h3>
        <p className="text-sm text-gray-500 italic">Revise os termos e finalize a ativação.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Multa Atraso</p>
           <p className="text-lg font-bold text-blue-600">
              {multaAtraso.tipo === "percentual" ? `${multaAtraso.valor}%` : `R$ ${multaAtraso.valor}`}
           </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Multa Rescisão</p>
           <p className="text-lg font-bold text-red-500">
              {multaRescisao.tipo === "percentual" ? `${multaRescisao.valor}%` : `R$ ${multaRescisao.valor}`}
           </p>
        </div>
        <div className="col-span-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Cláusulas</p>
              <p className="text-sm font-bold text-gray-800">{clausulas.filter(c => c.trim()).length} itens inclusos</p>
           </div>
           <Button 
             variant="ghost" 
             size="sm" 
             className="text-blue-600 font-bold text-[10px] uppercase hover:bg-blue-100/50"
             onClick={() => setStep(SetupStep.CLAUSES)}
           >
              Editar lista
           </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full h-14 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-2xl font-black shadow-sm group transition-all active:scale-[0.98]"
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
            <FileText className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
          )}
          VISUALIZAR MODELO (PDF)
        </Button>

        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-800 leading-relaxed italic">
              Ao concluir, todos os novos passageiros receberão este modelo via WhatsApp assim que forem cadastrados por você ou solicitarem vaga.
            </p>
        </div>
      </div>
    </div>
  );

  const podeFechar = !!profile?.config_contrato?.configurado;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && (podeFechar || (step === SetupStep.WELCOME && !usarContratos))) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="w-[calc(100%-1.5rem)] sm:w-full max-w-md p-0 overflow-hidden bg-white rounded-[2.5rem] border-0 shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        hideCloseButton
        onPointerDownOutside={(e) => !podeFechar && e.preventDefault()}
        onEscapeKeyDown={(e) => !podeFechar && e.preventDefault()}
      >
        <div className="bg-blue-600 p-6 text-center relative shrink-0">
          <DialogClose 
            className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/10" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </DialogClose>

          <div className="mx-auto bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20 shadow-inner">
            <FileText className="w-6 h-6 text-white" />
          </div>
          
          <DialogTitle className="text-xl font-black text-white px-8">
            {step === SetupStep.WELCOME ? "Configurar Contratos" : "Ajustes do Modelo"}
          </DialogTitle>
          
          <div className="mt-4 flex justify-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? "bg-white w-10" : i < step ? "bg-white/50 w-3" : "bg-white/20 w-3"}`}
                />
              ))}
          </div>
        </div>

        <div className="p-6 pt-8 flex-1 overflow-y-auto min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {step === SetupStep.WELCOME && renderWelcome()}
              {step === SetupStep.FEES && renderFees()}
              {step === SetupStep.CLAUSES && renderClauses()}
              {step === SetupStep.SIGNATURE && renderSignature()}
              {step === SetupStep.PREVIEW && renderPreview()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 flex gap-4 border-t border-gray-100 shrink-0">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-14 rounded-2xl font-bold text-gray-500 border-gray-200 hover:bg-white"
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            className={`flex-1 h-14 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 group ${
              step === SetupStep.PREVIEW ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <span>
                   {step === SetupStep.PREVIEW
                    ? "ATIVAR AGORA"
                    : step === SetupStep.WELCOME && !usarContratos
                    ? "CONFIRMAR"
                    : "CONTINUAR"}
                </span>
                {step < SetupStep.PREVIEW && <PenTool className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
      <PdfPreviewDialog
        isOpen={isPreviewPdfOpen}
        onClose={() => setIsPreviewPdfOpen(false)}
        pdfUrl={pdfUrl}
        title="Modelo do Contrato"
      />
    </Dialog>
  );
}
