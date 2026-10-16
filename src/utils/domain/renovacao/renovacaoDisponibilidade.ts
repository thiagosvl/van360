export const RENOVACAO_MESES_JANELA: readonly number[] = [10, 11, 12, 1, 2];

export function isRenovacaoJanelaAberta(referencia: Date = new Date()): boolean {
  return RENOVACAO_MESES_JANELA.includes(referencia.getMonth() + 1);
}

export function isRenovacaoLiberadaParaUsuario(_usuarioIds?: Array<string | null | undefined>): boolean {
  return true;
}

export function isRenovacaoDisponivel(usuarioIds?: Array<string | null | undefined>): boolean {
  return isRenovacaoJanelaAberta() && isRenovacaoLiberadaParaUsuario(usuarioIds);
}
