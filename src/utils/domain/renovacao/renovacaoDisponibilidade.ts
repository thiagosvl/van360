export const RENOVACAO_MESES_JANELA: readonly number[] = [10, 11, 12, 1, 2];

export function getDefaultAnoDestino(referencia: Date = new Date()): number {
  const currentYear = referencia.getFullYear();
  const currentMonth = referencia.getMonth() + 1;
  return currentMonth <= 2 ? currentYear : currentYear + 1;
}

export function isRenovacaoJanelaAberta(referencia: Date = new Date()): boolean {
  return RENOVACAO_MESES_JANELA.includes(referencia.getMonth() + 1);
}

export function isRenovacaoLiberadaParaUsuario(_usuarioIds?: Array<string | null | undefined>): boolean {
  return true;
}

export function isRenovacaoDisponivel(usuarioIds?: Array<string | null | undefined>): boolean {
  return isRenovacaoJanelaAberta() && isRenovacaoLiberadaParaUsuario(usuarioIds);
}
