import { Passageiro } from "@/types/passageiro";

export function formatarCEP(cep: string): string {
  if (!cep || cep === "") return "";
  const onlyNumbers = cep.replace(/\D/g, "");
  if (onlyNumbers.length !== 8) return cep;
  return onlyNumbers.replace(/(\d{5})(\d{3})/, "$1-$2");
}

export function formatarEnderecoCompleto(passageiro: Passageiro): string {
  const cep = formatarCEP(passageiro.cep);
  const lograoduro = passageiro.logradouro;
  const bairro = passageiro.bairro;
  const cidade = passageiro.cidade;
  const estado = passageiro.estado;
  const numero = passageiro.numero;
  const referencia = passageiro.referencia;

  if (referencia && referencia !== "") {
    return `${lograoduro}, ${numero} (${referencia}) - ${bairro}, ${cidade} - ${estado}, ${cep}`;
  }

  return `${lograoduro}, ${numero} - ${bairro}, ${cidade} - ${estado}, ${cep}`;
}

