import {
  ParentescoResponsavel,
  PassageiroGenero,
  PassageiroModalidade,
} from "@/types/enums";
import { getNowBR, parseLocalDate } from "../dateUtils";
import { formatFirstName } from "./name";

export const formatModalidade = (modalidade: string) => {
  switch (modalidade) {
    case PassageiroModalidade.IDA_VOLTA:
      return "Ida e Volta";
    case PassageiroModalidade.IDA:
      return "Somente Ida";
    case PassageiroModalidade.VOLTA:
      return "Somente Volta";
    default:
      return modalidade;
  }
};

export const formatGenero = (genero: string) => {
  switch (genero) {
    case PassageiroGenero.MASCULINO:
      return "Masculino";
    case PassageiroGenero.FEMININO:
      return "Feminino";
    default:
      return genero;
  }
};

export const formatParentesco = (parentesco: string) => {
  switch (parentesco) {
    case ParentescoResponsavel.PAI:
      return "Pai";
    case ParentescoResponsavel.MAE:
      return "Mãe";
    case ParentescoResponsavel.AVO:
      return "Avô/Avó";
    case ParentescoResponsavel.TIO:
      return "Tio/Tia";
    case ParentescoResponsavel.IRMAO:
      return "Irmão/Irmã";
    case ParentescoResponsavel.PRIMO:
      return "Primo/Prima";
    case ParentescoResponsavel.PADRASTRO:
      return "Padrasto";
    case ParentescoResponsavel.MADRASTA:
      return "Madrasta";
    case ParentescoResponsavel.RESPONSAVEL_LEGAL:
      return "Responsável Legal";
    case ParentescoResponsavel.OUTRO:
      return "Outro";
    default:
      return parentesco;
  }
};

export const calcularIdade = (dataNascimento?: string): number | null => {
  if (!dataNascimento) return null;
  const nascimento = parseLocalDate(dataNascimento);
  const hoje = getNowBR();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNascimento = nascimento.getMonth();
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

export const modalidades = Object.values(PassageiroModalidade).map((value) => ({
  value,
  label: formatModalidade(value),
}));

export const generos = Object.values(PassageiroGenero).map((value) => ({
  value,
  label: formatGenero(value),
}));

export const parentescos = Object.values(ParentescoResponsavel).map((value) => ({
  value,
  label: formatParentesco(value),
}));

export const getStudentPreposition = (
  genero?: PassageiroGenero | string | null,
  nome?: string
): string => {
  const g = typeof genero === "string" ? genero.toUpperCase() : genero;
  if (g === PassageiroGenero.FEMININO || g === "FEMININO") return "da";
  if (g === PassageiroGenero.MASCULINO || g === "MASCULINO") return "do";

  if (nome) {
    const firstName = formatFirstName(nome).trim().toLowerCase();
    if (firstName.endsWith("a")) return "da";
    if (firstName.endsWith("o")) return "do";
  }

  return "do(a)";
};
