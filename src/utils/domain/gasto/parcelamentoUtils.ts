import { parseLocalDate } from "@/utils/dateUtils";

/**
 * Retorna a descrição do gasto formatada dinamicamente para exibição na UI.
 * Se o gasto for parcelado, anexa dinamicamente `${numero_parcela}/${total_parcelas}` apenas na exibição.
 */
export const obterDescricaoFormatadaGasto = (gasto?: {
  descricao?: string | null;
  numero_parcela?: number | null;
  total_parcelas?: number | null;
} | null): string => {
  if (!gasto) return "Sem descrição";

  const rawDesc = (gasto.descricao || "").replace(/\s+\d+\/\d+$/, '').trim();
  const temParcelamento = Boolean(gasto.numero_parcela && gasto.total_parcelas && gasto.total_parcelas > 1);

  if (temParcelamento) {
    const suf = `${gasto.numero_parcela}/${gasto.total_parcelas}`;
    return rawDesc ? `${rawDesc} ${suf}` : `Parcela ${suf}`;
  }

  return rawDesc || "Sem descrição";
};

/**
 * Retorna os nomes dos meses projetados para um parcelamento.
 * Ex: ["Jul/26", "Ago/26", "Set/26"]
 */
export const obterMesesProjetados = (
  dataInicial: Date | string | undefined,
  qtdParcelas: number | undefined
): string[] => {
  if (!dataInicial || !qtdParcelas || qtdParcelas < 2) return [];

  const d = typeof dataInicial === 'string' ? parseLocalDate(dataInicial) : dataInicial;

  const nomesMeses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const mesesProjetados: string[] = [];

  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  for (let i = 0; i < qtdParcelas; i++) {
    const targetDate = new Date(year, month + i, 1);
    const maxDays = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(day, maxDays);
    targetDate.setDate(targetDay);

    const m = nomesMeses[targetDate.getMonth()];
    const y = String(targetDate.getFullYear()).slice(-2);
    mesesProjetados.push(`${m}/${y}`);
  }

  return mesesProjetados;
};

/**
 * Retorna o texto formatado do período de parcelamento.
 * Ex: "Jul/26 e Ago/26" ou "de Jul/26 até Jun/28"
 */
export const obterTextoPeriodo = (
  dataInicial: Date | string | undefined,
  qtdParcelas: number | undefined
): string => {
  const meses = obterMesesProjetados(dataInicial, qtdParcelas);
  if (meses.length === 0) return "";
  if (meses.length === 1) return meses[0];
  if (meses.length === 2) return `${meses[0]} e ${meses[1]}`;
  return `de ${meses[0]} até ${meses[meses.length - 1]}`;
};

export interface DetalhesOpcaoAcao {
  titulo: string;
  descricao: string;
}

export interface DetalhesAcaoParcelas {
  unica: DetalhesOpcaoAcao;
  futuras?: DetalhesOpcaoAcao | null;
  todas: DetalhesOpcaoAcao;
  eUltimaParcela: boolean;
}

/**
 * Calcula títulos e descrições contextuais para o diálogo de EDIÇÃO de parcelas.
 */
export const obterDetalhesEdicaoParcelas = (
  numeroParcela?: number | null,
  totalParcelas?: number | null
): DetalhesAcaoParcelas => {
  const n = numeroParcela || null;
  const total = totalParcelas || null;

  if (n && total) {
    const eUltimaParcela = n === total;
    const ePrimeiraParcela = n === 1;
    const mantidasOutras = total - 1;
    const alteradasFuturas = total - n + 1;

    return {
      eUltimaParcela,
      unica: {
        titulo: `Somente esta parcela (${n}/${total})`,
        descricao: mantidasOutras > 0
          ? `As outras ${mantidasOutras} parcelas serão mantidas sem alterações.`
          : `Altera apenas este registro.`,
      },
      futuras: eUltimaParcela
        ? null
        : {
            titulo: ePrimeiraParcela
              ? `Esta e as próximas parcelas (1 a ${total})`
              : `Esta e as próximas parcelas (${n} a ${total})`,
            descricao: ePrimeiraParcela
              ? `Serão alteradas todas as ${total} parcelas.`
              : `Serão alteradas ${alteradasFuturas} parcelas. As parcelas anteriores serão mantidas.`,
          },
      todas: {
        titulo: `Todas as parcelas`,
        descricao: `Altera todas as ${total} parcelas do histórico.`,
      },
    };
  }

  return {
    eUltimaParcela: false,
    unica: {
      titulo: "Somente esta parcela",
      descricao: "Altera apenas este registro selecionado.",
    },
    futuras: {
      titulo: "Esta e as próximas parcelas",
      descricao: "Altera esta parcela e todas as futuras da compra.",
    },
    todas: {
      titulo: "Todas as parcelas",
      descricao: "Altera todo o histórico deste parcelamento.",
    },
  };
};

/**
 * Calcula títulos e descrições contextuais para o diálogo de EXCLUSÃO de parcelas.
 */
export const obterDetalhesExclusaoParcelas = (
  numeroParcela?: number | null,
  totalParcelas?: number | null
): DetalhesAcaoParcelas => {
  const n = numeroParcela || null;
  const total = totalParcelas || null;

  if (n && total) {
    const eUltimaParcela = n === total;
    const ePrimeiraParcela = n === 1;
    const mantidasOutras = total - 1;
    const deletadasFuturas = total - n + 1;

    return {
      eUltimaParcela,
      unica: {
        titulo: `Somente esta parcela (${n}/${total})`,
        descricao: mantidasOutras > 0
          ? `As outras ${mantidasOutras} parcelas serão mantidas.`
          : `Este lançamento será excluído.`,
      },
      futuras: eUltimaParcela
        ? null
        : {
            titulo: ePrimeiraParcela
              ? `Esta e as próximas parcelas (1 a ${total})`
              : `Esta e as próximas parcelas (${n} a ${total})`,
            descricao: ePrimeiraParcela
              ? `Serão excluídas todas as ${total} parcelas.`
              : `Serão excluídas ${deletadasFuturas} parcelas. As parcelas anteriores serão mantidas.`,
          },
      todas: {
        titulo: `Todas as parcelas`,
        descricao: `Remove todas as ${total} parcelas do histórico.`,
      },
    };
  }

  return {
    eUltimaParcela: false,
    unica: {
      titulo: "Somente esta parcela",
      descricao: "As demais parcelas serão mantidas.",
    },
    futuras: {
      titulo: "Esta e as próximas parcelas",
      descricao: "Serão excluídas esta parcela e as próximas. As parcelas anteriores serão mantidas.",
    },
    todas: {
      titulo: "Todas as parcelas",
      descricao: "Remove todo o parcelamento do histórico.",
    },
  };
};
