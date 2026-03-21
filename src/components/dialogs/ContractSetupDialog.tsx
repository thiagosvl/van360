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
    } catch (err) {
      toast.error("erro.salvar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderWelcome = () => (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">
          Quer usar contratos automáticos?
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Gere PDFs com suas cláusulas, multas e colete assinaturas dos responsáveis.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setUsarContratos(true)}
          className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
            usarContratos
              ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            usarContratos ? "bg-blue-500" : "bg-gray-100"
          }`}>
            <FileText className={`w-5 h-5 ${usarContratos ? "text-white" : "text-gray-500"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${usarContratos ? "text-blue-900" : "text-gray-800"}`}>
              Sim, quero usar contratos
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
              PDFs automáticos, assinatura digital via WhatsApp
            </p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            usarContratos ? "border-blue-500 bg-blue-500" : "border-gray-300"
          }`}>
            {usarContratos && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setUsarContratos(false)}
          className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
            !usarContratos
              ? "border-gray-400 bg-gray-50 ring-1 ring-gray-200"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            !usarContratos ? "bg-gray-500" : "bg-gray-100"
          }`}>
            <X className={`w-5 h-5 ${!usarContratos ? "text-white" : "text-gray-400"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${!usarContratos ? "text-gray-900" : "text-gray-600"}`}>
              Não, prefiro gerenciar manualmente
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
              Você pode ativar essa função a qualquer momento
            </p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            !usarContratos ? "border-gray-500 bg-gray-500" : "border-gray-300"
          }`}>
            {!usarContratos && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </button>
      </div>

      <AnimatePresence>
        {!usarContratos && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex gap-2.5 items-start"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Sem problema! Nas configurações do seu perfil você pode ativar quando quiser.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderFees = () => (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Multas do Contrato</h3>
        </div>
        <p className="text-xs text-gray-500 ml-7">
          Defina as penalidades que constarão no contrato assinado pelos responsáveis.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-sm">
          <div>
            <Label className="text-gray-800 font-semibold text-sm">
              Multa por Atraso no Pagamento
            </Label>
            <p className="text-xs text-gray-500 mt-0.5">
              Cobrada manualmente por você sobre a mensalidade quando houver atraso.
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
              className="flex-1 rounded-xl text-center font-bold text-lg"
            />
            <Select
              value={multaAtraso.tipo}
              onValueChange={(v: "percentual" | "fixo") =>
                setMultaAtraso({ ...multaAtraso, tipo: v })
              }
            >
              <SelectTrigger className="w-36 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentual">% Porcentagem</SelectItem>
                <SelectItem value="fixo">R$ Valor fixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-xl border border-blue-100">
            <span className="font-medium">Exemplo: </span>
            mensalidade de R$ 200,00 → multa de{" "}
            <strong>
              {multaAtraso.tipo === "percentual"
                ? (200 * (multaAtraso.valor / 100)).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : multaAtraso.valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
            </strong>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-sm">
          <div>
            <Label className="text-gray-800 font-semibold text-sm">
              Multa por Cancelamento
            </Label>
            <p className="text-xs text-gray-500 mt-0.5">
              Cobrada manualmente por você quando o contrato é encerrado antes do prazo.
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
              className="flex-1 rounded-xl text-center font-bold text-lg"
            />
            <Select
              value={multaRescisao.tipo}
              onValueChange={(v: "percentual" | "fixo") =>
                setMultaRescisao({ ...multaRescisao, tipo: v })
              }
            >
              <SelectTrigger className="w-36 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentual">% Porcentagem</SelectItem>
                <SelectItem value="fixo">R$ Valor fixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-xl border border-blue-100">
            <span className="font-medium">Exemplo: </span>
            contrato de R$ 2.400,00 → multa de{" "}
            <strong>
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
            {multaRescisao.tipo === "percentual" &&
              ` (${multaRescisao.valor}% de R$ 2.400,00)`}
          </div>
        </div>
      </div>
    </div>
  );

  const renderClauses = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Cláusulas do Contrato</h3>
        </div>
        {clausulas.length > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {clausulas.length} {clausulas.length === 1 ? "cláusula" : "cláusulas"}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Cada cláusula aparecerá numerada no contrato. Edite os textos conforme sua necessidade.
      </p>

      <div className="space-y-3">
        {clausulas.map((clausula, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border transition-colors ${
              showErrors && clausula.trim() === ""
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between px-3 pt-3 pb-1">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                Cláusula {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => setClausulas(clausulas.filter((_, i) => i !== idx))}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover cláusula"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              autoFocus={idx === clausulas.length - 1 && clausula === ""}
              className={`w-full px-3 pb-3 pt-1 text-sm bg-transparent border-0 focus:outline-none resize-none leading-relaxed placeholder:text-gray-400 ${
                showErrors && clausula.trim() === "" ? "text-red-800" : "text-gray-700"
              }`}
              value={clausula}
              rows={3}
              onChange={(e) => {
                const newClausulas = [...clausulas];
                newClausulas[idx] = e.target.value;
                setClausulas(newClausulas);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onFocus={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="Descreva os termos desta cláusula..."
            />
            {showErrors && clausula.trim() === "" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 px-3 pb-2.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <p className="text-xs text-red-600">Preencha ou remova esta cláusula.</p>
              </motion.div>
            )}
          </div>
        ))}

        {clausulas.length > 0 ? (
          <Button
            variant="outline"
            className="w-full h-11 border-dashed border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-xl"
            onClick={() => setClausulas([...clausulas, ""])}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Cláusula
          </Button>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <PenTool className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1 font-medium">Nenhuma cláusula adicionada</p>
            <p className="text-xs text-gray-400 mb-4">Você precisa de ao menos uma cláusula.</p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-blue-200 text-blue-600"
              onClick={() => setClausulas([""])}
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar Primeira Cláusula
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSignature = () => (
    <div className="space-y-4">
      <div className="text-center space-y-1 mb-4">
        <h3 className="font-bold text-gray-900 text-lg">
          Sua Assinatura Digital
        </h3>
        <p className="text-sm text-gray-600">
          Desenhe sua assinatura abaixo. Ela será usada para assinar seus
          contratos automaticamente.
        </p>
      </div>

      <div className="relative border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 overflow-hidden touch-none">
        <SignatureCanvas
          ref={(ref) => {
            // @ts-ignore
            sigPad.current = ref;
            if (ref && signatureTemp) {
              // Ensure we don't overwrite if there's already drawing manually done by user
              // This ref callback might be called on re-renders, so be careful.
              // We only want to restore if canvas is empty and we have a temp value.
              if (ref.isEmpty()) {
                ref.fromDataURL(signatureTemp);
              }
            }
          }}
          penColor="rgb(0, 0, 128)"
          minWidth={1}
          maxWidth={2.5}
          canvasProps={{
            className: "w-full h-48 cursor-crosshair",
          }}
          onEnd={() => {
             // Save on every stroke to ensure state is up to date even if they click Back immediately
             if (sigPad.current && !sigPad.current.isEmpty()) {
                 setSignatureTemp(sigPad.current.toDataURL("image/png"));
             }
          }}
        />
        {signatureTemp && !sigPad.current?.isEmpty() === false && (
          <div className="absolute top-2 right-2 flex gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md">
              Assinatura Salva
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-center flex-col items-center gap-2">
        {signatureTemp && (
          <p className="text-xs text-gray-500">
            Uma assinatura já está salva. Desenhe acima apenas se quiser
            alterá-la.
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            sigPad.current?.clear();
            setSignatureTemp(null);
          }}
          className="text-gray-500 hover:text-red-600"
        >
          Limpar e refazer
        </Button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="flex flex-col items-center space-y-5 py-0">
      <div className="text-center space-y-1.5">
        <h3 className="text-xl font-bold text-gray-900">Tudo configurado!</h3>
        <p className="text-sm text-gray-500 max-w-[280px] mx-auto leading-relaxed">
          Você pode alterar as configurações a qualquer momento.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-gray-500">Multa por atraso</span>
          <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
            {multaAtraso.tipo === "percentual"
              ? `${multaAtraso.valor}%`
              : multaAtraso.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-gray-500">Multa por cancelamento</span>
          <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
            {multaRescisao.tipo === "percentual"
              ? `${multaRescisao.valor}%`
              : multaRescisao.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-gray-500">Cláusulas</span>
          <span className="text-xs font-semibold text-gray-800">
            {clausulas.filter((c) => c.trim()).length} incluídas
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-gray-500">Assinatura digital</span>
          <span className="text-xs font-semibold text-green-700">✓ Capturada</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-2xl font-bold gap-2"
        disabled={previewMutation.isPending}
        onClick={async () => {
          try {
            const result = await previewMutation.mutateAsync({
              clausulas,
              multaAtraso,
              multaRescisao,
              assinaturaCondutorUrl: signatureTemp || profile?.assinatura_digital_url,
            });

            if (pdfUrlRef.current) {
              window.URL.revokeObjectURL(pdfUrlRef.current);
            }

            pdfUrlRef.current = result.url;
            setPdfUrl(result.url);
            setIsPreviewPdfOpen(true);
          } catch (err) {
            // Error is handled by mutation's onError
          }
        }}
      >
        {previewMutation.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <FileText className="w-5 h-5" />
        )}
        Visualizar Contrato (PDF)
      </Button>

      <p className="text-[11px] text-gray-500 text-center leading-relaxed px-2">
        Os próximos passageiros cadastrados receberão este contrato automaticamente para assinar.
      </p>
    </div>
  );

  const podeFechar = !!profile?.config_contrato?.configurado;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          // Permite fechar se já estiver configurado OU se estiver no passo 1 e decidiu não usar contratos
          if (podeFechar || (step === SetupStep.WELCOME && !usarContratos)) {
            onClose();
          }
        }
      }}
    >
      <DialogContent
        className="w-[calc(100%-1.5rem)] sm:w-full max-w-md p-0 overflow-hidden bg-white rounded-2xl sm:rounded-3xl border-0 shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        hideCloseButton
        onPointerDownOutside={(e) => !podeFechar && e.preventDefault()}
        onEscapeKeyDown={(e) => !podeFechar && e.preventDefault()}
      >
        <div className="bg-blue-600 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between text-white shrink-0 gap-4 relative">
          {/* Custom Close Button matching EscolaFormDialog (Mobile) */}
          {podeFechar && (
            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors sm:hidden" onClick={onClose}>
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>
          )}

          <div className="flex items-center gap-3 pr-8 sm:pr-0">
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold truncate">
                Configuração de Contrato
              </DialogTitle>
              <p className="text-xs text-blue-100 italic">
                Passo {step + 1} de 5
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 justify-end items-center">
             {/* Desktop Close Button */}
              {podeFechar && (
                <DialogClose className="hidden sm:block text-white/70 hover:text-white transition-colors ml-4" onClick={onClose}>
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              )}
            
            <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className={`h-1 w-3 sm:h-1.5 sm:w-4 rounded-full transition-all ${step === i ? "bg-white w-6 sm:w-8" : "bg-white/30"}`}
                />
                ))}
            </div>
          </div>
        </div>

        <div className="p-5 pt-2 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
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

        <div className="p-4 sm:p-6 bg-gray-50 flex gap-3 border-t">
          {step > 0 && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex-1 h-12 rounded-2xl font-semibold text-gray-600"
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            className={`flex-1 h-12 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 ${
              step === SetupStep.PREVIEW
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === SetupStep.PREVIEW
                  ? "Concluir"
                  : step === SetupStep.WELCOME && !usarContratos
                  ? "Confirmar"
                  : "Próximo"}
              </>
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
