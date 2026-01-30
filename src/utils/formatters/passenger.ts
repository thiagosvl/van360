import {
    ParentescoResponsavel,
    PassageiroGenero,
    PassageiroModalidade,
} from "@/types/enums";

export const formatModalidade = (modalidade: string) => {
  switch (modalidade) {
    case PassageiroModalidade.IDA:
      return "Ida";
    case PassageiroModalidade.VOLTA:
      return "Volta";
    case PassageiroModalidade.IDA_VOLTA:
      return "Ida e Volta";
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
    case PassageiroGenero.PREFIRO_NAO_INFORMAR:
      return "Prefiro não informar";
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
