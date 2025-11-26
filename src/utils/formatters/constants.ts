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

export const tiposPagamento = [
  { value: "PIX", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao-debito", label: "Cartão de Débito" },
  { value: "cartao-credito", label: "Cartão de Crédito" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
];

export const periodos = [
  { value: "integral", label: "Integral" },
  { value: "manha", label: "Manhã" },
  { value: "almoco", label: "Almoço" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

