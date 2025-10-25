import { Passageiro } from "@/types/passageiro";

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

export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatDate = (date: string | Date) => {
  const d = new Date(date + "T00:00:00");
  return d;
};

export const formatDateToBR = (date: string | Date): string => {
  const newDate = new Date(date + "T00:00:00");
  return newDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatProfile = (profile: string): string => {
  if (profile === "admin") {
    return "Admin";
  }
  return "Motorista";
};

export const formatCobrancaOrigem = (origem: string): string => {
  if (origem === "automatica") {
    return "Automática";
  }
  return "Manual";
};

export const formatDateTimeToBR = (
  date: string | Date,
  options: { includeTime?: boolean } = {}
): string => {
  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const formattedDate = dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (options.includeTime) {
      const formattedTime = dateObj.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${formattedDate} ${formattedTime}`;
    }

    return formattedDate;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export const formatStatus = (origem: string): string => {
  if (origem === "pago") {
    return "Pago";
  }
  return "Pendente";
};

export const getStatusText = (status: string, dataVencimento: string) => {
  if (status === "pago") return "Pago";

  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (vencimento < hoje) {
    return `Venceu há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  } else if (diffDays == 0) {
    return "Vence hoje";
  }

  return "A vencer";
};

export const checkCobrancaJaVenceu = (dataVencimento: string) => {
  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return vencimento < hoje;
}

export const getStatusColor = (status: string, dataVencimento: string) => {
  if (status === "pago") return "bg-green-100 text-green-800";

  return checkCobrancaJaVenceu(dataVencimento)
    ? "bg-red-100 text-red-800"
    : "bg-orange-100 text-orange-800";
};

export const formatPaymentType = (tipo: string | undefined) => {
  if (!tipo) return "";

  const typeMap: { [key: string]: string } = {
    dinheiro: "Dinheiro",
    "cartao-credito": "Cartão de Crédito",
    "cartao-debito": "Cartão de Débito",
    transferencia: "Transferência",
    PIX: "PIX",
    boleto: "Boleto",
  };

  return typeMap[tipo] || tipo;
};

export const currentMonthInText = () => {
  const date = new Date();
  return meses[date.getMonth()];
}

export const getMesNome = (mes: number) => {
  const currentYear = new Date().getFullYear();
  const nomeMes = new Date(currentYear, mes - 1).toLocaleDateString("pt-BR", {
    month: "long",
  });
  return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
};

export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length !== 11) return telefone;

  const ddd = numeros.slice(0, 2);
  const parte1 = numeros.slice(2, 7);
  const parte2 = numeros.slice(7);

  return `(${ddd}) ${parte1}-${parte2}`;
}

export function formatarCEP(cep: string): string {
  if (!cep || cep === "") return "";
  const onlyNumbers = cep.replace(/\D/g, "");
  if (onlyNumbers.length !== 8) return cep;
  return onlyNumbers.replace(/(\d{5})(\d{3})/, "$1-$2");
}


export function formatarEnderecoCompleto(passageiro: Passageiro): string {
  const cep = formatarCEP(passageiro.cep);
  const lograoduro = passageiro.logradouro;
  const bairro = passageiro.bairro;
  const cidade = passageiro.cidade;
  const estado = passageiro.estado;
  const numero = passageiro.numero;
  const referencia = passageiro.referencia;

  let enderecoCompleto;

  if (referencia != "" && referencia != null) {
    enderecoCompleto = `${lograoduro}, ${numero} (${referencia}) - ${bairro}, ${cidade} - ${estado}, ${cep}`;
  } else {
    enderecoCompleto = `${lograoduro}, ${numero} - ${bairro}, ${cidade} - ${estado}, ${cep}`;
  }

  return enderecoCompleto;
}

export function cleanString(value?: string, collapseInternalSpaces = false): string {
  if (!value) return "";
  let cleaned = value.trim();

  if (collapseInternalSpaces) {
    cleaned = cleaned.replace(/\s+/g, " ");
  }

  return cleaned;
}

export function parseCurrencyToNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}
