import { getNowBR } from "@/utils/dateUtils";

export const getDefaultAnoLetivo = (): string => {
  const currentMonth = getNowBR().getMonth() + 1;
  if (currentMonth >= 11) {
    return "";
  }
  return getNowBR().getFullYear().toString();
};

export const getAnoLetivoOptions = (anoExistente?: string | number | null): string[] => {
  const currentYear = getNowBR().getFullYear();
  const options = new Set<string>([
    currentYear.toString(),
    (currentYear + 1).toString(),
  ]);

  if (anoExistente) {
    options.add(anoExistente.toString());
  }

  return Array.from(options).sort((a, b) => Number(a) - Number(b));
};

export const getAnoCobrancaFimOptions = (anoInicio?: string | number | null): string[] => {
  const baseYear = anoInicio ? Number(anoInicio) : getNowBR().getFullYear();
  return [
    baseYear.toString(),
    (baseYear + 1).toString(),
  ];
};

export const getAnoCobrancaInicioOptions = (anoLetivo?: string | number | null): string[] => {
  const currentYear = getNowBR().getFullYear();
  const options = new Set<string>([
    currentYear.toString(),
    (currentYear + 1).toString(),
  ]);

  if (anoLetivo) {
    options.add(anoLetivo.toString());
  }

  return Array.from(options).sort((a, b) => Number(a) - Number(b));
};

export const isCobrancaRetroativa = (
  mesInicio?: string | number | null,
  anoInicio?: string | number | null
): boolean => {
  if (!mesInicio || !anoInicio) return false;
  const now = getNowBR();
  const currentTotalMonths = now.getFullYear() * 12 + (now.getMonth() + 1);
  const selectedTotalMonths = Number(anoInicio) * 12 + Number(mesInicio);
  return selectedTotalMonths < currentTotalMonths;
};

export const COBRANCA_BANNER_MESSAGES = {
  PADRAO: "As parcelas serão geradas a partir do mês de início selecionado.",
  RETROATIVA: "Atenção: Selecionar meses anteriores ao atual gerará parcelas retroativas como pendentes.",
} as const;
