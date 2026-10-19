import { Passageiro } from "@/types/passageiro";
import { Usuario } from "@/types/usuario";

export enum StatusConfiguracaoContrato {
  /** O usuário nunca cadastrou a assinatura digital nem configurou as regras iniciais */
  NAO_CONFIGURADO = "NAO_CONFIGURADO",
  /** O usuário já possui assinatura e modelo configurados, mas desativou a chave 'usar_contratos' */
  DESATIVADO = "DESATIVADO",
  /** Contratos totalmente configurados e ativos na conta */
  ATIVO = "ATIVO",
}

/**
 * Retorna o estado atual da funcionalidade de contratos para a conta do usuário.
 */
export function obterStatusConfiguracaoContrato(
  profile?: Partial<Usuario> | null
): StatusConfiguracaoContrato {
  const isConfigurado = !!profile?.assinatura_digital_url;
  const isAtivo = !!profile?.config_contrato?.usar_contratos;

  if (!isConfigurado) {
    return StatusConfiguracaoContrato.NAO_CONFIGURADO;
  }
  if (!isAtivo) {
    return StatusConfiguracaoContrato.DESATIVADO;
  }
  return StatusConfiguracaoContrato.ATIVO;
}

export function isContratoAtivoNaConta(
  profile?: Partial<Usuario> | null
): boolean {
  return obterStatusConfiguracaoContrato(profile) === StatusConfiguracaoContrato.ATIVO;
}

export interface PendenciasContratoResult {
  needsNomeResp: boolean;
  needsTelefoneResp: boolean;
  needsCpfResp: boolean;
  needsParentesco: boolean;
  needsResponsavelGroup: boolean;
  needsValor: boolean;
  needsVencimento: boolean;
  needsFinanceiroGroup: boolean;
  hasPendencias: boolean;
}

export function avaliarPendenciasContrato(
  passageiro?: Partial<Passageiro> | null
): PendenciasContratoResult {
  const resp = passageiro?.responsavel_principal;
  const needsNomeResp = !resp?.nome || resp.nome.trim() === "";
  const needsTelefoneResp = !resp?.telefone || resp.telefone.replace(/\D/g, "").length < 10;
  const rawCpf = resp?.cpf || "";
  const needsCpfResp = rawCpf.replace(/\D/g, "").length !== 11;
  const needsParentesco = !resp?.parentesco;
  const needsResponsavelGroup =
    needsNomeResp || needsTelefoneResp || needsCpfResp || needsParentesco;

  const needsValor =
    !passageiro?.isento &&
    (!passageiro?.valor_cobranca || Number(passageiro.valor_cobranca) <= 0);
  const needsVencimento = !passageiro?.isento && !passageiro?.dia_vencimento;
  const needsFinanceiroGroup = needsValor || needsVencimento;

  const hasPendencias =
    needsResponsavelGroup || needsFinanceiroGroup;

  return {
    needsNomeResp,
    needsTelefoneResp,
    needsCpfResp,
    needsParentesco,
    needsResponsavelGroup,
    needsValor,
    needsVencimento,
    needsFinanceiroGroup,
    hasPendencias,
  };
}

export function hasPendenciasParaGerarContrato(
  passageiro?: Partial<Passageiro> | null
): boolean {
  if (!passageiro) return true;
  return avaliarPendenciasContrato(passageiro).hasPendencias;
}
