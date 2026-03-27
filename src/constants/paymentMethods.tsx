import { CobrancaTipoPagamento } from "@/types/enums";
import { formatPaymentType } from "@/utils/formatters";
import {
  Banknote,
  CreditCard,
  FileText,
  QrCode,
  Send
} from "lucide-react";
import { ReactNode } from "react";

export interface PaymentMethodOption {
  value: CobrancaTipoPagamento;
  label: string;
  icon: ReactNode;
  color: string;
}


export const getPaymentMethodLabel = (type?: CobrancaTipoPagamento) => {
  if (!type) return "";
  const labels: Record<string, string> = {
    [CobrancaTipoPagamento.DINHEIRO]: "Dinheiro",
    [CobrancaTipoPagamento.PIX]: "PIX",
    [CobrancaTipoPagamento.TRANSFERENCIA]: "Transferência",
    [CobrancaTipoPagamento.BOLETO]: "Boleto",
    [CobrancaTipoPagamento.CARTAO_CREDITO]: "Crédito",
    [CobrancaTipoPagamento.CARTAO_DEBITO]: "Débito",
  };
  return labels[type] || type;
};

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    value: CobrancaTipoPagamento.PIX,
    label: formatPaymentType(CobrancaTipoPagamento.PIX),
    icon: <QrCode className="w-5 h-5" />,
    color: "text-emerald-600",
  },
  {
    value: CobrancaTipoPagamento.DINHEIRO,
    label: formatPaymentType(CobrancaTipoPagamento.DINHEIRO),
    icon: <Banknote className="w-5 h-5" />,
    color: "text-green-600",
  },
  {
    value: CobrancaTipoPagamento.CARTAO_CREDITO,
    label: formatPaymentType(CobrancaTipoPagamento.CARTAO_CREDITO),
    icon: <CreditCard className="w-5 h-5" />,
    color: "text-blue-600",
  },
  {
    value: CobrancaTipoPagamento.CARTAO_DEBITO,
    label: formatPaymentType(CobrancaTipoPagamento.CARTAO_DEBITO),
    icon: <CreditCard className="w-5 h-5" />,
    color: "text-indigo-600",
  },
  {
    value: CobrancaTipoPagamento.TRANSFERENCIA,
    label: formatPaymentType(CobrancaTipoPagamento.TRANSFERENCIA),
    icon: <Send className="w-5 h-5" />,
    color: "text-orange-600",
  },
  {
    value: CobrancaTipoPagamento.BOLETO,
    label: formatPaymentType(CobrancaTipoPagamento.BOLETO),
    icon: <FileText className="w-5 h-5" />,
    color: "text-slate-600",
  },
];

export const getPaymentMethodByValue = (value: string) => {
  return PAYMENT_METHODS.find((m) => m.value === value);
};
