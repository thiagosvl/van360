import { UserType } from "@/types/enums";
import { Usuario } from "@/types/usuario";

type UserLike = Partial<Pick<Usuario, "id" | "tipo" | "conta_pai_id">> | null | undefined;

export function isMotoristaTitular(user?: UserLike): boolean {
  return user?.tipo === UserType.MOTORISTA && !user?.conta_pai_id;
}

export function isSubConta(user?: UserLike): boolean {
  return Boolean(user?.conta_pai_id);
}

export function isMotoristaAuxiliar(user?: UserLike): boolean {
  return user?.tipo === UserType.MOTORISTA_AUXILIAR;
}

export function isMonitor(user?: UserLike): boolean {
  return user?.tipo === UserType.MONITOR;
}

export function isResponsavel(user?: UserLike): boolean {
  return user?.tipo === UserType.RESPONSAVEL;
}

export function getDonoContaId(user?: UserLike): string | undefined {
  return user?.conta_pai_id || user?.id;
}
