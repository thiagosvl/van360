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

export function usePixPassageiroResolver() {
  const { financeiro, isLoading } = useMotoristaFinanceiroApi();

  const chavePadraoConta = financeiro?.chave_pix_repasse || null;
  const tipoChavePadraoConta = financeiro?.tipo_chave_pix || null;
  const modoCobranca = (financeiro?.modo_cobranca as ModoCobrancaEnum) || ModoCobrancaEnum.DESATIVADO;

  const getPixInfo = useMemo(() => {
    return (passageiro?: Partial<Passageiro> | null, veiculo?: Partial<Veiculo> | null): PixPassageiroInfo => {
      if (passageiro?.chave_pix && passageiro.chave_pix.trim() !== "") {
        return {
          chaveOriginal: passageiro.chave_pix,
          chaveFormatada: formatarChavePix(passageiro.chave_pix, passageiro.tipo_chave_pix),
          tipo: passageiro.tipo_chave_pix || null,
          isPropria: true,
          origem: "aluno",
          origemLabel: "Chave individual do aluno",
        };
      }

      const veiculoAluno = veiculo || passageiro?.veiculo;
      if (veiculoAluno?.chave_pix && veiculoAluno.chave_pix.trim() !== "") {
        const placaFormatada = veiculoAluno.placa ? formatarPlacaExibicao(veiculoAluno.placa) : "da van";
        return {
          chaveOriginal: veiculoAluno.chave_pix,
          chaveFormatada: formatarChavePix(veiculoAluno.chave_pix, veiculoAluno.tipo_chave_pix),
          tipo: veiculoAluno.tipo_chave_pix || null,
          isPropria: false,
          origem: "veiculo",
          origemLabel: `Chave do veículo (${placaFormatada})`,
        };
      }

      if (chavePadraoConta && chavePadraoConta.trim() !== "") {
        return {
          chaveOriginal: chavePadraoConta,
          chaveFormatada: formatarChavePix(chavePadraoConta, tipoChavePadraoConta),
          tipo: tipoChavePadraoConta,
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
