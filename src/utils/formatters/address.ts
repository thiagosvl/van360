
export interface AddressHolder {
  logradouro?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  referencia?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  uf?: string | null;
  cep?: string | null;
  responsavel_principal?: AddressHolder | null;
  responsaveis?: Array<{ responsavel?: AddressHolder | null } & AddressHolder> | null;
  [key: string]: unknown;
}

export function formatarCEP(cep: string): string {
  if (!cep || cep === "") return "";
  const onlyNumbers = cep.replace(/\D/g, "");
  if (onlyNumbers.length !== 8) return cep;
  return onlyNumbers.replace(/(\d{5})(\d{3})/, "$1-$2");
}

export function formatarEnderecoCompleto(obj: AddressHolder | null | undefined): string {
  if (!obj) return "";
  const addrTarget = (obj.logradouro || obj.endereco)
    ? obj
    : (obj.responsavel_principal?.logradouro
      ? obj.responsavel_principal
      : (obj.responsaveis?.[0]?.responsavel?.logradouro
        ? obj.responsaveis[0].responsavel
        : (obj.responsaveis?.[0]?.logradouro ? obj.responsaveis[0] : null)));

  if (!addrTarget) return "";

  const logradouro = addrTarget.logradouro || addrTarget.endereco || "";
  const numero = addrTarget.numero ? `, ${addrTarget.numero}` : "";
  const complemento = addrTarget.complemento ? ` - ${addrTarget.complemento}` : "";
  const bairro = addrTarget.bairro ? ` - ${addrTarget.bairro}` : "";
  const cidade = addrTarget.cidade ? `, ${addrTarget.cidade}` : "";
  const estadoUf = addrTarget.estado || addrTarget.uf ? ` - ${addrTarget.estado || addrTarget.uf}` : "";
  const cepStr = addrTarget.cep ? `, ${formatarCEP(addrTarget.cep)}` : "";

  const mainAddress = `${logradouro}${numero}${complemento}`.trim();
  if (!mainAddress && !cidade && !bairro) return "";

  if (mainAddress.startsWith(",")) {
    return `${mainAddress.slice(1).trim()}${bairro}${cidade}${estadoUf}${cepStr}`;
  }

  return `${mainAddress}${bairro}${cidade}${estadoUf}${cepStr}`;
}

export function formatarEnderecoParcialRota(obj: AddressHolder | null | undefined): string {
  if (!obj) return "";
  const addrTarget = (obj.logradouro || obj.endereco)
    ? obj
    : (obj.responsavel_principal?.logradouro
      ? obj.responsavel_principal
      : (obj.responsaveis?.[0]?.responsavel?.logradouro
        ? obj.responsaveis[0].responsavel
        : (obj.responsaveis?.[0]?.logradouro ? obj.responsaveis[0] : null)));

  if (!addrTarget) return "";

  const logradouro = addrTarget.logradouro || addrTarget.endereco || "";
  const numero = addrTarget.numero ? `, ${addrTarget.numero}` : "";
  const complemento = addrTarget.complemento ? ` (${addrTarget.complemento})` : "";
  const bairro = addrTarget.bairro ? ` - ${addrTarget.bairro}` : "";

  const mainAddress = `${logradouro}${numero}${complemento}`.trim();
  if (!mainAddress && !bairro) return "";

  if (mainAddress.startsWith(",")) {
    return `${mainAddress.slice(1).trim()}${bairro}`;
  }

  return `${mainAddress}${bairro}`;
}

