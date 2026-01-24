import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCobranca } from "@/hooks/api/useCobrancaMutations";
import { cn } from "@/lib/utils";
import { CobrancaOrigem, CobrancaStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Send,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface FirstChargeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro;
}

type Step =
  | "REGISTER_CHECK"
  | "PAYMENT_STATUS"
  | "PAYMENT_METHOD"
  | "AUTOMATION_CHECK";

export default function FirstChargeDialog({
  isOpen,
  onClose,
  passageiro,
}: FirstChargeDialogProps) {
  const [step, setStep] = useState<Step>("REGISTER_CHECK");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PENDING" | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [sendNotification, setSendNotification] = useState(true);
  const [customValue, setCustomValue] = useState<string>(
    passageiro.valor_cobranca ? String(passageiro.valor_cobranca) : "",
  );

  const createCobranca = useCreateCobranca();
  const queryClient = useQueryClient();

  const currentMonthName = new Date().toLocaleString("pt-BR", {
    month: "long",
  });
  const currentMonthNameCapitalized =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const firstNameResponsavel = passageiro.nome?.split(" ")[0];
  const firstNamePassageiro = passageiro.nome_responsavel?.split(" ")[0];

  const handlePaymentStatusSelection = async (status: "PAID" | "PENDING") => {
    setPaymentStatus(status);

    if (status === "PAID") {
      setStep("PAYMENT_METHOD");
    } else {
      // Se pendente, verifica automação
      if (passageiro.enviar_cobranca_automatica) {
        setStep("AUTOMATION_CHECK");
      } else {
        // Sem automação, cria pendente direto
        await submitCobranca(CobrancaStatus.PENDENTE, false);
      }
    }
  };

  const handleBack = () => {
    if (step === "PAYMENT_STATUS") {
      setStep("REGISTER_CHECK");
    } else if (step === "PAYMENT_METHOD") {
      setStep("PAYMENT_STATUS");
    } else if (step === "AUTOMATION_CHECK") {
      setStep("PAYMENT_STATUS");
    }
  };

  const handleNext = async () => {
    // 1. REGISTER CHECK
    if (step === "REGISTER_CHECK") {
      setStep("PAYMENT_STATUS");
      return;
    }

    // 3. PAYMENT METHOD (PAID)
    if (step === "PAYMENT_METHOD") {
      if (!paymentMethod) {
        toast.error("Selecione uma forma de pagamento");
        return;
      }
      await submitCobranca(CobrancaStatus.PAGO, false);
      return;
    }

    // 4. AUTOMATION_CHECK handled by buttons
  };

  const submitCobranca = async (
    status: CobrancaStatus,
    generatePixAndNotify: boolean,
  ) => {
    const today = new Date();
    const vencimento = today.toISOString().split("T")[0]; // Hoje

    try {
      // valor sanitization
      let valor = passageiro.valor_cobranca || 0;
      if (customValue) {
        const num = parseFloat(
          customValue
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim(),
        );
        if (!isNaN(num)) valor = num;
      }

      const payload: any = {
        passageiro_id: passageiro.id,
        usuario_id: passageiro.usuario_id,
        valor: valor,
        data_vencimento: vencimento,
        status: status,
        mes: today.getMonth() + 1,
        ano: today.getFullYear(),
        origem: CobrancaOrigem.MANUAL,
        enviar_notificacao_agora: generatePixAndNotify,
      };

      if (status === CobrancaStatus.PAGO) {
        payload.tipo_pagamento = paymentMethod;
        payload.data_pagamento = vencimento;
        payload.valor_pago = valor;
        payload.pagamento_manual = true;
      }

      await createCobranca.mutateAsync(payload);

      if (generatePixAndNotify) {
        toast.success("Cobrança criada e enviada com sucesso!");
      } else {
        toast.success("Cobrança criada com sucesso!");
      }

      // Invalidar resumo para atualizar KPIs na Home
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = createCobranca.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[425px] w-[90%] rounded-3xl gap-0 p-0 overflow-hidden border-0 shadow-2xl"
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="relative px-6 pt-6 pb-2 shrink-0">
          {step !== "REGISTER_CHECK" && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-6 top-6 h-8 w-8 -ml-3 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100/80 transition-all"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            Mensalidade de {currentMonthNameCapitalized}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          {step === "REGISTER_CHECK" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                <div className="bg-blue-100 p-4 rounded-full shrink-0 shadow-sm ring-4 ring-blue-50">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 font-medium leading-relaxed max-w-[240px] mx-auto">
                    Deseja registrar o pagamento deste mês no histórico
                    financeiro?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={handleNext}
                  className="h-14 rounded-2xl font-bold gap-2 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Sim, registrar pagamento
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="h-12 rounded-2xl text-gray-500 hover:text-gray-900 font-medium hover:bg-gray-50"
                >
                  Não, ignorar este mês
                </Button>
              </div>
            </div>
          )}

          {step === "PAYMENT_STATUS" && (
            <div className="space-y-6 pt-2">
              <div className="text-center px-4">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-gray-50/50">
                  <Wallet className="w-8 h-8 text-gray-400" />
                </div>

                <p className="text-gray-900 text-lg leading-relaxed font-medium max-w-[320px] mx-auto">
                  O responsável de{" "}
                  <span className="text-blue-600 font-bold">
                    {firstNamePassageiro} ({firstNameResponsavel})
                  </span>{" "}
                  já realizou o pagamento deste mês?
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start px-5 gap-4 border border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-700 group transition-all relative overflow-hidden"
                  onClick={() => handlePaymentStatusSelection("PAID")}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-blue-500 flex items-center justify-center transition-colors shrink-0 bg-white shadow-sm">
                    <div className="w-4 h-4 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all transform scale-0 group-hover:scale-100" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-gray-900 text-lg group-hover:text-blue-900 transition-colors">
                      Sim, já recebi
                    </span>
                    <span className="text-gray-500 font-medium group-hover:text-blue-600/80 transition-colors">
                      Informar forma de pagamento
                    </span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start px-5 gap-4 border border-gray-200 rounded-2xl hover:border-orange-500 hover:bg-orange-50/50 hover:text-orange-700 group transition-all relative overflow-hidden"
                  onClick={() => handlePaymentStatusSelection("PENDING")}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-orange-500 flex items-center justify-center transition-colors shrink-0 bg-white shadow-sm">
                    <div className="w-4 h-4 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-all transform scale-0 group-hover:scale-100" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-gray-900 text-lg group-hover:text-orange-900 transition-colors">
                      Não, ainda vai pagar
                    </span>
                    <span className="text-gray-500 font-medium group-hover:text-orange-600/80 transition-colors">
                      Gerar cobrança pendente
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {step === "PAYMENT_METHOD" && (
            <div className="space-y-8 pt-4">
              <div className="text-center px-4">
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
                  <CreditCard className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-bold text-xl text-gray-900">
                  Qual foi a forma de pagamento?
                </p>
              </div>

              <div className="space-y-6">
                <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                  <SelectTrigger
                    className={cn(
                      "pl-5 h-16 rounded-2xl bg-white border border-gray-200 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus:border-blue-500 transition-all text-left text-lg shadow-sm hover:border-gray-300",
                      !paymentMethod && "text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Wallet className="h-6 w-6 text-gray-400" />
                      <SelectValue placeholder="Selecione..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px] rounded-2xl border-gray-100 shadow-xl p-2">
                    {[
                      "dinheiro",
                      "PIX",
                      "cartao-credito",
                      "cartao-debito",
                      "transferencia",
                      "boleto",
                    ].map((val) => (
                      <SelectItem
                        key={val}
                        value={val}
                        className="py-3 px-4 rounded-xl cursor-pointer focus:bg-gray-50 text-base"
                      >
                        {val === "PIX"
                          ? "PIX"
                          : val === "cartao-credito"
                            ? "Cartão de Crédito"
                            : val === "cartao-debito"
                              ? "Cartão de Débito"
                              : val.charAt(0).toUpperCase() + val.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleNext}
                  disabled={isLoading || !paymentMethod}
                  className="w-full h-14 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:translate-y-[-2px]"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Confirmar Recebimento"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "AUTOMATION_CHECK" && (
            <div className="space-y-8 pt-4">
              <div className="bg-violet-50/80 p-6 rounded-3xl border border-violet-100/50 flex flex-col items-center text-center gap-4">
                <div className="bg-violet-100 p-4 rounded-full shrink-0 shadow-sm ring-4 ring-violet-50">
                  <Send className="w-8 h-8 text-violet-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xl text-gray-900">
                    Enviar Cobrança Agora?
                  </h4>
                  <p className="text-gray-500 leading-relaxed max-w-[260px]">
                    Este passageiro tem cobrança automática. Deseja enviar a
                    notificação no WhatsApp já?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => submitCobranca(CobrancaStatus.PENDENTE, true)}
                  disabled={isLoading}
                  className="bg-violet-600 hover:bg-violet-700 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all hover:translate-y-[-2px]"
                >
                  Sim, enviar no WhatsApp
                </Button>
                <Button
                  onClick={() => submitCobranca(CobrancaStatus.PENDENTE, false)}
                  variant="ghost"
                  disabled={isLoading}
                  className="h-12 rounded-2xl text-gray-500 hover:text-gray-900 font-medium hover:bg-gray-50"
                >
                  Não, apenas gerar pendente
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
