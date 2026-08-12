import { Profile } from "@/types/usuario";

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
  profile?: Partial<Profile> | null
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
