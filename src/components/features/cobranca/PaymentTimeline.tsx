import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus, RepasseState } from "@/types/enums";
import { formatDateToBR, formatPaymentType } from "@/utils/formatters";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface PaymentTimelineProps {
  cobranca: Cobranca;
}

export function PaymentTimeline({ cobranca }: PaymentTimelineProps) {
  const status = cobranca.status;
  const statusRepasse = cobranca.status_repasse;
  const isC6 = cobranca.origem === "C6_BANK" || !!cobranca.gateway_txid; // Melhorar checagem para englobar qualquer PIX originado da tela de Pagar Manualmente, pois também tem fluxo de repasse

  // Timeline logic
  const steps = [];

  // Step 1: Gerada
  steps.push({
    id: "gerada",
    title: "Cobrança Gerada",
    description: `Vencimento: ${formatDateToBR(cobranca.data_vencimento)}`,
    status: "done",
  });

  if (status === CobrancaStatus.PAGO) {
    // Passo 2: Pagamento Concluído
    const dateDescription =
      cobranca.data_pagamento
        ? cobranca.pagamento_manual
          ? `Pago em ${formatDateToBR(cobranca.data_pagamento)}`
          : `Pago em ${formatDateToBR(cobranca.data_pagamento)} às ${new Date(cobranca.data_pagamento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
        : formatPaymentType(cobranca.tipo_pagamento);

    steps.push({
      id: "pago",
      title: "Pagamento Concluído",
      description: dateDescription,
      status: "done",
    });

    // Se for um fluxo de repasse (PIX/C6) E NÃO for pagamento manual
    if (!cobranca.pagamento_manual && isC6 && (statusRepasse || cobranca.repasse)) {
        const repasseEstado = cobranca.repasse?.estado || statusRepasse;
        
        const isRepassado = repasseEstado === RepasseState.LIQUIDADO;
        const isAguardandoAprovacao = repasseEstado === RepasseState.AGUARDANDO_APROVACAO;
        
        // Estados que indicam que o sistema está trabalhando (DE → SUBMETIDO)
        const isTrabalhando = [
            RepasseState.CRIADO,
            RepasseState.DECODIFICANDO,
            RepasseState.DECODIFICADO,
            RepasseState.SUBMETIDO
        ].includes(repasseEstado as any);

        const isLiquidando = repasseEstado === RepasseState.EM_LIQUIDACAO;

        const isFalha = [
            RepasseState.ERRO_DECODIFICACAO,
            RepasseState.ERRO_TRANSFERENCIA,
            RepasseState.EXPIRADO,
            RepasseState.CANCELADO
        ].includes(repasseEstado as any);

        // Passo 3: Processamento Bancário
        let procDescription = "Aguardando início...";
        if (isTrabalhando) procDescription = "Preparando transferência...";
        if (isAguardandoAprovacao) procDescription = "Aguardando aprovação no app do banco";
        if (isLiquidando) procDescription = "Aprovado! Aguardando banco liquidar...";
        if (isRepassado) procDescription = "Transferência concluída";
        if (isFalha) procDescription = repasseEstado === RepasseState.CANCELADO ? "Repasse cancelado" : "Houve um problema no repasse";

        steps.push({
            id: "processamento",
            title: "Processamento Bancário",
            description: procDescription,
            status: isRepassado ? "done" : isFalha ? "error" : (isTrabalhando || isAguardandoAprovacao || isLiquidando) ? "current" : "pending",
        });

        // Passo 4: Saldo Disponível
        steps.push({
            id: "liquidado",
            title: "Saldo Disponível",
            description: isRepassado ? "O dinheiro já está na sua conta" : "Aguardando conclusão do repasse",
            status: isRepassado ? "done" : "pending",
        });
    } else if (!cobranca.pagamento_manual && isC6 && !statusRepasse) {
        // Fluxo Automático que ainda não tem repasse associado
        steps.push({
            id: "processamento",
            title: "Processamento Bancário",
            description: "Preparando repasse...",
            status: "current",
        });
        steps.push({
            id: "liquidado",
            title: "Saldo Disponível",
            description: "Aguardando Repasse",
            status: "pending",
        });
    } else if (cobranca.pagamento_manual) {
        // Pagamento manual puro - Ciclo termina no Pagamento Concluído (já adicionado acima)
        // Mas para manter as 2 etapas visuais claras conforme falado:
        // A "Cobrança Gerada" já existe. "Pagamento Concluído" já existe.
        // Não adicionamos mais nada.
    } else {
        // Caso genérico fallback (ex: pagamento manual antigo que caiu aqui por erro de flag)
        steps.push({
            id: "liquidado",
            title: "Saldo Disponível",
            description: "O dinheiro já está com você",
            status: "done",
        });
    }
  } else {
    // Pendente
    steps.push({
        id: "identificado",
        title: "Pagamento Identificado",
        description: "Aguardando pagamento",
        status: "pending",
    });
    steps.push({
        id: "processamento",
        title: "Processamento",
        description: "Aguardando...",
        status: "pending",
    });
    steps.push({
        id: "liquidado",
        title: "Saldo Disponível",
        description: "Disponível no saldo",
        status: "pending",
    });
  }

  return (
    <div className="relative border-l-2 border-gray-100 ml-3 py-2 space-y-8">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        let icon = <Circle className="w-5 h-5 text-gray-300 fill-white" />;
        let dotClass = "bg-white border-gray-200";
        let textClass = "text-gray-400";
        let titleClass = "text-gray-500 font-medium";

        if (step.status === "done") {
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-white" />;
            textClass = "text-gray-500";
            titleClass = "text-emerald-700 font-bold";
        } else if (step.status === "current") {
            icon = <div className="p-0.5 bg-white rounded-full"><Loader2 className="w-4 h-4 text-blue-500 animate-spin" /></div>;
            textClass = "text-blue-600";
            titleClass = "text-blue-700 font-bold";
        } else if (step.status === "error") {
             icon = <Circle className="w-5 h-5 text-red-500 fill-white" />;
             textClass = "text-red-500";
             titleClass = "text-red-600 font-bold";
        }

        return (
          <div key={step.id} className="relative pl-6">
            {/* Dot */}
            <div className="absolute -left-[11px] top-0 bg-white shadow-[0_0_0_4px_white]">
               {icon}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-0.5 -mt-0.5">
              <span className={cn("text-sm", titleClass)}>{step.title}</span>
              <span className={cn("text-xs font-medium", textClass)}>
                {step.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
