import { PassageiroPeriodo } from "@/types/enums";

export interface AlunoComPeriodo {
  id?: string;
  nome?: string;
  periodo?: string | PassageiroPeriodo | null;
}

export function formatarNomeTurno(periodo?: string | null): string {
  if (!periodo) return "Outros";

  const p = periodo.toLowerCase().trim();
  if (p === PassageiroPeriodo.MANHA || p === "manhã" || p === "manha") {
    return "Manhã";
  }
  if (p === PassageiroPeriodo.TARDE || p === "tarde") {
    return "Tarde";
  }
  if (p === PassageiroPeriodo.NOITE || p === "noite") {
    return "Noite";
  }
  if (p === PassageiroPeriodo.INTEGRAL || p === "integral") {
    return "Integral";
  }

  return "Outros";
}

export function agruparAlunosPorTurno<T extends AlunoComPeriodo>(
  alunos: T[],
): Record<string, T[]> {
  const agrupado: Record<string, T[]> = {
    Manhã: [],
    Tarde: [],
    Noite: [],
    Integral: [],
    Outros: [],
  };

  if (!Array.isArray(alunos)) return agrupado;

  alunos.forEach((aluno) => {
    const turno = formatarNomeTurno(aluno.periodo);
    if (!agrupado[turno]) {
      agrupado[turno] = [];
    }
    agrupado[turno].push(aluno);
  });

  return agrupado;
}

export function calcularResumoAlunosPorTurno<T extends AlunoComPeriodo>(
  alunos: T[],
): Record<string, number> {
  const agrupado = agruparAlunosPorTurno(alunos);
  return {
    Manhã: agrupado.Manhã.length,
    Tarde: agrupado.Tarde.length,
    Noite: agrupado.Noite.length,
    Integral: agrupado.Integral.length,
    Outros: agrupado.Outros.length,
  };
}
