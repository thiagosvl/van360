import { useMemo } from "react";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { ModoCobrancaEnum } from "@/types/enums";
import { Veiculo } from "@/types/veiculo";
import { formatarChavePix } from "@/utils/formatters/pix";

export interface PixVeiculoInfo {
  chaveOriginal: string;
  chaveFormatada: string;
  tipo: string | null;
  isPropria: boolean;
  origemLabel: string;
}

export function usePixVeiculoResolver() {
  const { user } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);
  const { financeiro, isLoading: isFinanceiroLoading } = useMotoristaFinanceiroApi();

  const isLoading = isProfileLoading || isFinanceiroLoading;

  const chavePadrao = financeiro?.chave_pix_repasse || profile?.chave_pix || null;
  const tipoChavePadrao = financeiro?.tipo_chave_pix || profile?.tipo_chave_pix || null;
  const modoCobranca = (financeiro?.modo_cobranca as ModoCobrancaEnum) || ModoCobrancaEnum.DESATIVADO;

  const temPixAtivoNaConta = Boolean(chavePadrao && modoCobranca !== ModoCobrancaEnum.DESATIVADO);

  const getPixInfo = useMemo(() => {
    return (veiculo?: Veiculo | null): PixVeiculoInfo | null => {
      if (!temPixAtivoNaConta) return null;

      if (veiculo?.chave_pix && veiculo.chave_pix.trim() !== "") {
        return {
          chaveOriginal: veiculo.chave_pix,
          chaveFormatada: formatarChavePix(veiculo.chave_pix, veiculo.tipo_chave_pix),
          tipo: veiculo.tipo_chave_pix || null,
          isPropria: true,
          origemLabel: "Chave Pix do Veículo",
        };
      }

      if (chavePadrao) {
        return {
          chaveOriginal: chavePadrao,
          chaveFormatada: formatarChavePix(chavePadrao, tipoChavePadrao),
          tipo: tipoChavePadrao,
          isPropria: false,
          origemLabel: "Padrão da conta",
        };
      }

      return null;
    };
  }, [temPixAtivoNaConta, chavePadrao, tipoChavePadrao]);

  return {
    isLoading,
    temPixAtivoNaConta,
    chavePadrao,
    tipoChavePadrao,
    modoCobranca,
    getPixInfo,
  };
}
