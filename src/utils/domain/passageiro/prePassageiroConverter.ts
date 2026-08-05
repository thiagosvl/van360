import { PrePassageiro } from "@/types/prePassageiro";
import { PassageiroFormData } from "@/hooks/form/usePassageiroForm";
import { formatDateToBR } from "@/utils/formatters/date";
import { cepMask, cpfMask, moneyMask, phoneMask } from "@/utils/masks";

const getMonthFromDate = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return "";
  return parseInt(parts[1], 10).toString();
};

/**
 * Converte e mapeia os dados do pré-cadastro de passageiro para o formulário oficial de cadastro definitivo.
 */
export function mapearPrePassageiroParaFormulario(pre: PrePassageiro): Partial<PassageiroFormData> {
  return {
    nome: pre.nome || "",
    nome_responsavel: pre.nome_responsavel || "",
    cpf_responsavel: pre.cpf_responsavel ? cpfMask(pre.cpf_responsavel) : "",
    telefone_responsavel: pre.telefone_responsavel ? phoneMask(pre.telefone_responsavel) : "",
    periodo: pre.periodo || "",
    modalidade: pre.modalidade || "",
    turma: pre.turma || "",
    nome_professor: pre.nome_professor || "",
    data_nascimento: pre.data_nascimento ? formatDateToBR(pre.data_nascimento) : "",
    genero: pre.genero || "",
    parentesco_responsavel: pre.parentesco_responsavel || "",
    logradouro: pre.logradouro || "",
    numero: pre.numero || "",
    bairro: pre.bairro || "",
    cidade: pre.cidade || "",
    estado: pre.estado || "",
    cep: pre.cep ? cepMask(pre.cep) : "",
    referencia: pre.referencia || "",
    complemento: pre.complemento || "",
    observacoes: pre.observacoes || "",
    veiculo_id: pre.veiculo_id || "",
    escola_id: pre.escola_id || "",
    valor_cobranca: pre.valor_cobranca
      ? moneyMask(String(Math.round(Number(pre.valor_cobranca) * 100)))
      : "",
    dia_vencimento: pre.dia_vencimento?.toString() || "",
    data_inicio_transporte: pre.data_inicio_transporte ? formatDateToBR(pre.data_inicio_transporte) : "",
    data_fim_transporte: pre.data_fim_transporte ? formatDateToBR(pre.data_fim_transporte) : "",
    mes_inicio_cobranca: pre.data_inicio_cobranca ? getMonthFromDate(pre.data_inicio_cobranca) : "",
    mes_fim_cobranca: pre.data_fim_cobranca ? getMonthFromDate(pre.data_fim_cobranca) : "",
    ativo: true,
  };
}
