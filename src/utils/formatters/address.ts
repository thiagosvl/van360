
export function formatarCEP(cep: string): string {
  if (!cep || cep === "") return "";
  const onlyNumbers = cep.replace(/\D/g, "");
  if (onlyNumbers.length !== 8) return cep;
  return onlyNumbers.replace(/(\d{5})(\d{3})/, "$1-$2");
}

export function formatarEnderecoCompleto(obj: any): string {
  if(!obj.cep) return "";
  const cep = formatarCEP(obj.cep);
  const lograoduro = obj.logradouro;
  const bairro = obj.bairro;
  const cidade = obj.cidade;
  const estado = obj.estado;
  const numero = obj.numero;
  const referencia = obj.referencia;

  const complemento = obj.complemento;

  let addressStr = `${lograoduro}, ${numero}`;
  if (complemento && complemento !== "") {
    addressStr += ` - ${complemento}`;
  }
  
  if (referencia && referencia !== "") {
    addressStr += ` (${referencia})`;
  }
  
  return `${addressStr} - ${bairro}, ${cidade} - ${estado}, ${cep}`;
}

