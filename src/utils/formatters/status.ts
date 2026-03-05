import { CobrancaStatus, RepasseState } from "@/types/enums";
import { checkCobrancaEmAtraso } from "./cobranca";
import { formatDate } from "./date";

export const getStatusText = (status: string, dataVencimento: string, statusRepasse?: string) => {
  if (status === CobrancaStatus.PAGO) {
    if (statusRepasse === RepasseState.ERRO_TRANSFERENCIA || statusRepasse === RepasseState.ERRO_DECODIFICACAO) return "Falha no repasse";
    if (statusRepasse === RepasseState.LIQUIDADO) return "Repassado";
    if (statusRepasse === RepasseState.AGUARDANDO_APROVACAO) return "Aguardando aprovação banco";
    if (statusRepasse === RepasseState.EM_LIQUIDACAO) return "Liquidando repasse";
    if ([RepasseState.CRIADO, RepasseState.DECODIFICANDO, RepasseState.DECODIFICADO, RepasseState.SUBMETIDO].includes(statusRepasse as any)) return "Processando repasse";
    return "Pago";
  }

  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (vencimento < hoje) {
    return "Em atraso";
  } else if (diffDays === 0) {
    return "Vence hoje";
  }

  return "Pendente";
};

export const getStatusColor = (status: string, dataVencimento: string, statusRepasse?: string) => {
  if (status === CobrancaStatus.PAGO) {
    if (statusRepasse === RepasseState.ERRO_TRANSFERENCIA || statusRepasse === RepasseState.ERRO_DECODIFICACAO) 
      return "bg-red-100 text-red-800 hover:bg-red-200 border-transparent shadow-sm";
    
    if (statusRepasse === RepasseState.LIQUIDADO)
      return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent shadow-sm";

    if ([RepasseState.EM_LIQUIDACAO, RepasseState.SUBMETIDO, RepasseState.AGUARDANDO_APROVACAO, RepasseState.DECODIFICADO, RepasseState.DECODIFICANDO, RepasseState.CRIADO].includes(statusRepasse as any))
      return "bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent shadow-sm";

    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent shadow-sm";
  }

  if (checkCobrancaEmAtraso(dataVencimento)) {
    return "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-sm";
  }

  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  vencimento.setHours(0, 0, 0, 0);
  
  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border-orange-200 shadow-sm";
  }

  return "bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent shadow-sm";
};

