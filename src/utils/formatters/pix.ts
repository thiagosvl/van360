import { cpfCnpjMask, phoneMask, evpMask } from "@/utils/masks";
import { PixKeyType } from "@/types/enums";

export function formatarChavePix(chave?: string | null, tipo?: string | null): string {
  if (!chave || chave.trim() === "") return "—";

  const clean = chave.trim();
  const tipoUpper = (tipo || "").toUpperCase();

  if (tipoUpper === PixKeyType.TELEFONE) {
    return phoneMask(clean);
  }

  if (
    tipoUpper === PixKeyType.EVP ||
    tipoUpper === PixKeyType.ALEATORIA ||
    clean.length === 32
  ) {
    return evpMask(clean);
  }

  if (
    tipoUpper === PixKeyType.CPF ||
    tipoUpper === PixKeyType.CNPJ ||
    (!tipoUpper && (/^\d{11}$/.test(clean) || /^\d{14}$/.test(clean)))
  ) {
    return cpfCnpjMask(clean);
  }

  if (/^\d{10,11}$/.test(clean) && !clean.includes("@")) {
    return phoneMask(clean);
  }

  return clean;
}
