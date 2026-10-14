import { isDevEnv } from "@/utils/detectPlatform";

export const RENOVACAO_MESES_JANELA: readonly number[] = [10, 11, 12, 1, 2];

export const RENOVACAO_USUARIOS_LIBERADOS: readonly string[] = [
  "256e496d-c6d3-4450-b100-4ae7d693ad2e",
];

export function isRenovacaoJanelaAberta(referencia: Date = new Date()): boolean {
  return RENOVACAO_MESES_JANELA.includes(referencia.getMonth() + 1);
}

export function isRenovacaoLiberadaParaUsuario(usuarioIds: Array<string | null | undefined>): boolean {
  if (isDevEnv()) return true;
  return usuarioIds.some((id) => Boolean(id) && RENOVACAO_USUARIOS_LIBERADOS.includes(id as string));
}

export function isRenovacaoDisponivel(usuarioIds: Array<string | null | undefined>): boolean {
  return isRenovacaoJanelaAberta() && isRenovacaoLiberadaParaUsuario(usuarioIds);
}
