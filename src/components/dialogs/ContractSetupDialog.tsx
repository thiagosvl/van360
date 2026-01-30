import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_CLAUSULAS_CONTRATO } from "@/constants/defaults";
import { usePreviewContrato } from "@/hooks/api/useContratos";
import { usePermissions } from "@/hooks/business/usePermissions";
import { usuarioApi } from "@/services/api/usuario.api";
import { queryClient } from "@/services/queryClient";
import { toast } from "@/utils/notifications/toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Loader2,
  PenTool,
  Plus,
  ShieldCheck,
  Trash2,
  X,
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
  const { profile, refreshProfile } = usePermissions();
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

  // Initialize from profile or default
  useEffect(() => {
    if (isOpen && profile) {
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
      if (profile.assinatura_url && !signatureTemp) {
        setSignatureTemp(profile.assinatura_url);
      }

      const configurado = profile.config_contrato?.configurado;
      const usar = profile.config_contrato?.usar_contratos;

      if (configurado && usar) {
        setUsarContratos(true);
        setStep(SetupStep.WELCOME);
      } else {
        setUsarContratos(usar ?? true);
        setStep(SetupStep.WELCOME);
      }
    }
  }, [isOpen, profile]);

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
      const hasSaved = !!profile?.assinatura_url;
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
      let signatureUrl = signatureTemp || profile.assinatura_url;

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
        assinatura_url: signatureUrl,
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Proteja seu Negócio
        </h2>
        <p className="text-gray-600">
          Você pode automatizar a geração e
          assinatura de contratos com os pais de forma simples e segura.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Usar contratos automáticos
            </p>
            <p className="text-xs text-gray-500">
              Gere PDFs e colete assinaturas via WhatsApp
            </p>
          </div>
        </div>
        <Switch checked={usarContratos} onCheckedChange={setUsarContratos} />
      </div>

      {!usarContratos && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
          <X className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Você pode ativar esta funcionalidade a qualquer momento nas
            configurações do seu perfil.
          </p>
        </div>
      )}
    </div>
  );

  const renderFees = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Taxas e Multas</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
          <Label className="text-gray-700 font-semibold">
            Multa Mensal por Atraso
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={multaAtraso.valor}
              onChange={(e) =>
                setMultaAtraso({
                  ...multaAtraso,
                  valor: Number(e.target.value),
                })
              }
              className="flex-1 rounded-xl"
            />
            <Select
              value={multaAtraso.tipo}
              onValueChange={(v: "percentual" | "fixo") =>
                setMultaAtraso({ ...multaAtraso, tipo: v })
              }
            >
              <SelectTrigger className="w-32 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentual">Porcentagem (%)</SelectItem>
                <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-blue-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50 italic">
            Ex: Em uma mensalidade de R$ 200,00, a multa por atraso será de{" "}
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
            .
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
          <Label className="text-gray-700 font-semibold">
            Multa por Rescisão/Cancelamento
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={multaRescisao.valor}
              onChange={(e) =>
                setMultaRescisao({
                  ...multaRescisao,
                  valor: Number(e.target.value),
                })
              }
              className="flex-1 rounded-xl"
            />
            <Select
              value={multaRescisao.tipo}
              onValueChange={(v: "percentual" | "fixo") =>
                setMultaRescisao({ ...multaRescisao, tipo: v })
              }
            >
              <SelectTrigger className="w-32 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentual">Porcentagem (%)</SelectItem>
                <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-blue-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50 italic">
            Ex: Caso o contrato seja encerrado, a multa de rescisão será de{" "}
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
              ` (referente a ${multaRescisao.valor}% do valor total de um contrato de R$ 2.400,00)`}
            .
          </p>
        </div>
      </div>
    </div>
  );

  const renderClauses = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <PenTool className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Cláusulas do Contrato</h3>
      </div>

      <ScrollArea className="h-64 pr-4">
        <div className="space-y-4">
          {clausulas.map((clausula, idx) => (
            <div key={idx} className="group relative">
              <div className="flex gap-2 items-start">
                <div className="mt-3 bg-gray-100 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    autoFocus={idx === clausulas.length - 1 && clausula === ""}
                    className={`w-full p-3 text-sm bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none min-h-[80px] ${
                      showErrors && clausula.trim() === ""
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200"
                    }`}
                    value={clausula}
                    onChange={(e) => {
                      const newClausulas = [...clausulas];
                      newClausulas[idx] = e.target.value;
                      setClausulas(newClausulas);
                    }}
                    placeholder="Descreva os termos da cláusula..."
                  />
                  <button
                    onClick={() =>
                      setClausulas(clausulas.filter((_, i) => i !== idx))
                    }
                    className="absolute top-0 right-1 p-1.5 text-gray-400 hover:text-red-500 bg-white/80 rounded-lg opacity-50 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {showErrors && clausula.trim() === "" && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 mt-1.5 ml-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <p className="text-xs font-medium text-red-600">
                        Campo obrigatório. Preencha ou remova esta cláusula.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {clausulas.length > 0 && (
            <Button
              variant="outline"
              className="w-full h-10 border-dashed border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl mt-2"
              onClick={() => setClausulas([...clausulas, ""])}
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Cláusula
            </Button>
          )}

          {clausulas.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-sm text-gray-400 mb-4">
                Nenhuma cláusula adicionada.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-blue-200 text-blue-600"
                onClick={() => setClausulas([...clausulas, ""])}
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar Primeira Cláusula
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
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
    <div className="flex flex-col items-center justify-center space-y-6 py-4">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
        <ShieldCheck className="w-10 h-10 text-blue-600" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-900">Quase lá!</h3>
        <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
          Suas configurações e assinatura foram capturadas. Visualize como seus
          contratos ficarão antes de finalizar.
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-2xl font-bold gap-2"
        disabled={previewMutation.isPending}
        // Send ALL draft config including signature
        onClick={() =>
          previewMutation.mutate({
            clausulas,
            multaAtraso,
            multaRescisao,
            assinaturaCondutorUrl: signatureTemp || profile?.assinatura_url,
          })
        }
      >
        {previewMutation.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <FileText className="w-5 h-5" />
        )}
        Visualizar Modelo (PDF)
      </Button>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
        <div className="shrink-0 mt-0.5">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          <strong>Lembrete:</strong> Ao finalizar, novos passageiros aprovados
          receberão este modelo automaticamente para assinatura.
        </p>
      </div>
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
        className="w-[calc(100%-1.5rem)] sm:w-full max-w-md p-0 overflow-hidden bg-white rounded-2xl sm:rounded-3xl border-0 shadow-2xl"
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

        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
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
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === SetupStep.PREVIEW ? "Finalizar Tudo" : "Próximo"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
