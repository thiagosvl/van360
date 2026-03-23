export const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const currentYear = new Date().getFullYear();

export const anos = [
  {
    value: (currentYear - 1).toString(),
    label: (currentYear - 1).toString(),
  },
  { value: currentYear.toString(), label: currentYear.toString() },
  {
    value: (currentYear + 1).toString(),
    label: (currentYear + 1).toString(),
  },
];

import { CobrancaTipoPagamento } from "@/types/enums";

export const tiposPagamento = [
  { value: CobrancaTipoPagamento.PIX, label: "PIX" },
  { value: CobrancaTipoPagamento.DINHEIRO, label: "Dinheiro" },
  { value: CobrancaTipoPagamento.CARTAO_DEBITO, label: "Cartão de Débito" },
  { value: CobrancaTipoPagamento.CARTAO_CREDITO, label: "Cartão de Crédito" },
  { value: CobrancaTipoPagamento.TRANSFERENCIA, label: "Transferência" },
  { value: CobrancaTipoPagamento.BOLETO, label: "Boleto Bancário" },
];
