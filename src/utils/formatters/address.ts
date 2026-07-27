
export function formatarCEP(cep: string): string {
  if (!cep || cep === "") return "";
  const onlyNumbers = cep.replace(/\D/g, "");
  if (onlyNumbers.length !== 8) return cep;
  return onlyNumbers.replace(/(\d{5})(\d{3})/, "$1-$2");
}

export function formatarEnderecoCompleto(obj: {
  cep?: string | null;
  logradouro?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  uf?: string | null;
  complemento?: string | null;
  referencia?: string | null;
}): string {
  if (!obj) return "";

  const logradouro = obj.logradouro || obj.endereco || "";
  const numero = obj.numero ? `, ${obj.numero}` : "";
  const complemento = obj.complemento ? ` - ${obj.complemento}` : "";
  const referencia = obj.referencia ? ` (${obj.referencia})` : "";
  const bairro = obj.bairro ? ` - ${obj.bairro}` : "";
  const cidade = obj.cidade ? `, ${obj.cidade}` : "";
  const estadoUf = obj.estado || obj.uf ? ` - ${obj.estado || obj.uf}` : "";
  const cepStr = obj.cep ? `, ${formatarCEP(obj.cep)}` : "";

  const mainAddress = `${logradouro}${numero}${complemento}${referencia}`.trim();
  if (!mainAddress && !cidade && !bairro) return "";

  if (mainAddress.startsWith(",")) {
    return `${mainAddress.slice(1).trim()}${bairro}${cidade}${estadoUf}${cepStr}`;
  }

  return `${mainAddress}${bairro}${cidade}${estadoUf}${cepStr}`;
}

