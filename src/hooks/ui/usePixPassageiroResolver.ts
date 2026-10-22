import { useMemo } from "react";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { ModoCobrancaEnum } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { Veiculo } from "@/types/veiculo";
import { formatarChavePix } from "@/utils/formatters/pix";
import { formatarPlacaExibicao } from "@/utils/domain";

export type PixOrigemTipo = "aluno" | "veiculo" | "conta" | "nenhuma";

export interface PixPassageiroInfo {
  chaveOriginal: string | null;
  chaveFormatada: string | null;
  tipo: string | null;
  isPropria: boolean;
  origem: PixOrigemTipo;
  origemLabel: string;
}

export function resolverPixPassageiro(
  passageiro?: Partial<Passageiro> | Record<string, unknown> | null,
  veiculo?: Partial<Veiculo> | Record<string, unknown> | null,
  chavePadraoConta?: string | null,
  tipoChavePadraoConta?: string | null
): PixPassageiroInfo {
  const tipoPassageiro = typeof passageiro?.tipo_chave_pix === "string" ? passageiro.tipo_chave_pix : null;
  if (passageiro?.chave_pix && typeof passageiro.chave_pix === "string" && passageiro.chave_pix.trim() !== "") {
    return {
      chaveOriginal: passageiro.chave_pix.trim(),
      chaveFormatada: formatarChavePix(passageiro.chave_pix.trim(), tipoPassageiro || undefined),
      tipo: tipoPassageiro,
      isPropria: true,
      origem: "aluno",
      origemLabel: "Chave individual do aluno",
    };
  }

  const rawVeiculo = veiculo || (passageiro as Record<string, unknown> | null | undefined)?.veiculo;
  const veiculoAluno = Array.isArray(rawVeiculo) ? (rawVeiculo[0] as Partial<Veiculo> | undefined) : (rawVeiculo as Partial<Veiculo> | undefined);
  const tipoVeiculo = typeof veiculoAluno?.tipo_chave_pix === "string" ? veiculoAluno.tipo_chave_pix : null;

  if (veiculoAluno?.chave_pix && typeof veiculoAluno.chave_pix === "string" && veiculoAluno.chave_pix.trim() !== "") {
    const placaFormatada = veiculoAluno.placa ? formatarPlacaExibicao(veiculoAluno.placa) : "da van";
    return {
      chaveOriginal: veiculoAluno.chave_pix.trim(),
      chaveFormatada: formatarChavePix(veiculoAluno.chave_pix.trim(), tipoVeiculo || undefined),
      tipo: tipoVeiculo,
      isPropria: false,
      origem: "veiculo",
      origemLabel: `Chave do veículo (${placaFormatada})`,
    };
  }

  if (chavePadraoConta && chavePadraoConta.trim() !== "") {
    return {
      chaveOriginal: chavePadraoConta.trim(),
      chaveFormatada: formatarChavePix(chavePadraoConta.trim(), tipoChavePadraoConta),
      tipo: tipoChavePadraoConta || null,
      isPropria: false,
      origem: "conta",
      origemLabel: "Padrão da conta",
    };
  }

  return {
    chaveOriginal: null,
    chaveFormatada: null,
    tipo: null,
    isPropria: false,
    origem: "nenhuma",
    origemLabel: "Nenhuma chave configurada",
  };
}

export function usePixPassageiroResolver() {
  const { financeiro, isLoading } = useMotoristaFinanceiroApi();

  const chavePadraoConta = financeiro?.chave_pix_repasse || null;
  const tipoChavePadraoConta = financeiro?.tipo_chave_pix || null;
  const modoCobranca = (financeiro?.modo_cobranca as ModoCobrancaEnum) || ModoCobrancaEnum.DESATIVADO;

  const getPixInfo = useMemo(() => {
    return (passageiro?: Partial<Passageiro> | Record<string, unknown> | null, veiculo?: Partial<Veiculo> | Record<string, unknown> | null): PixPassageiroInfo => {
      return resolverPixPassageiro(passageiro, veiculo, chavePadraoConta, tipoChavePadraoConta);
    };
  }, [chavePadraoConta, tipoChavePadraoConta]);

  return {
    isLoading,
    chavePadraoConta,
    tipoChavePadraoConta,
    modoCobranca,
    getPixInfo,
  };
}
